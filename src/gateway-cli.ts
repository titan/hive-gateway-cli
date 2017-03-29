import * as http from 'http';
import * as msgpack from 'msgpack-lite';
import * as program from 'commander';

function convert_date(json) {
  if (json instanceof Array) {
    const items = [];
    for (const i of json) {
      items.push(convert_date(i));
    }
    return items;
  } else if (typeof(json) === 'number') {
    return json;
  } else if (typeof(json) === 'string') {
    if (json.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.*Z/)) {
      return new Date(json);
    } else {
      return json;
    }
  } else {
    const item = {};
    for (const key of Object.keys(json)) {
      item[key] = convert_date(json[key]);
    }
    return item;
  }
}

program
.version('1.0.0')
.option('-H, --host <host>', 'Host address of gateway', 'localhost')
.option('-p, --port <port>', 'Port of gateway', 80)
.option('-P, --path <path>', 'Path of gateway', '/')
.option('-o, --openid <openid>', 'OpenID of user', '')
.option('-m, --mod [mod]', 'Module')
.option('-f, --fun [fun]', 'Function to call')
.option('-a, --arg [value]', 'JSON arguments to function')
.option('-v, --verbose', 'Verbose output')
.parse(process.argv);

const opts = program.opts();

if (!opts["mod"]) {
  program.missingArgument("mod");
}

if (!opts["fun"]) {
  program.missingArgument("fun");
}

const data: Buffer = msgpack.encode({
  "mod": opts["mod"],
  "fun": opts["fun"],
  "arg": opts["arg"] ? convert_date(JSON.parse(opts["arg"])) : null,
  "ctx": {
    "wxuser": opts["openid"]
  }
});

const options = {
  hostname: opts["host"],
  port: opts["port"],
  path: opts["path"],
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': data.length
  }
};

let req = http.request(options, (rep) => {
  if (opts.verbose) {
    console.log(`STATUS: ${rep.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(rep.headers)}`);
  }
  let chunks: Buffer[] = [];
  rep.on('data', (chunk) => {
    const data: Buffer = chunk as Buffer;
    chunks.push(data);
  });
  rep.on('end', () => {
    if (rep.statusCode < 300) {
      let buffer = Buffer.concat(chunks);
      let msg = msgpack.decode(buffer);
      if (opts.verbose) {
        console.log(`BODY: ${JSON.stringify(msg)}`);
      } else {
        console.log(JSON.stringify(msg));
      }
    } else {
      let buffer = Buffer.concat(chunks);
      if (opts.verbose) {
        console.log(`BODY: ${buffer.toString()}`);
      } else {
        console.log(buffer.toString());
      }
    }
  });
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

// write data to request body
req.write(data);
req.end();

