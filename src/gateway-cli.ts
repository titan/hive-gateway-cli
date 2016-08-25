import * as http from 'http';
import * as msgpack from 'msgpack-lite';
import * as program from 'commander';

function collect(val, args) {
  let num = Number.parseFloat(val);
  if (Number.isNaN(num)) {
    try {
      let j = JSON.parse(val);
      args.push(j);
    } catch (e) {
      args.push(val);
    }
  } else {
    args.push(num);
  }
  return args;
}

program
.version('1.0.0')
.option('-H, --host <host>', 'Host address of gateway', 'localhost')
.option('-p, --port <port>', 'Port of gateway', 8000)
.option('-m, --mod [mod]', 'Module')
.option('-f, --fun [fun]', 'Function to call')
.option('-a, --arg [value]', 'Arguments to function', collect, [])
.parse(process.argv);

let opts = program.opts();

if (!opts["mod"]) {
  program.missingArgument("mod");
}

if (!opts["fun"]) {
  program.missingArgument("fun");
}

let data: Buffer = msgpack.encode({"mod": opts["mod"], "fun": opts["fun"], "arg": opts["args"]});

let options = {
  hostname: opts["host"],
  port: opts["port"],
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': data.length
  }
};

let req = http.request(options, (rep) => {
  console.log(`STATUS: ${rep.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(rep.headers)}`);
  let chunks: Buffer[] = [];
  rep.on('data', (chunk) => {
    chunks.push(chunk);
  });
  rep.on('end', () => {
    let buffer = Buffer.concat(chunks);
    let msg = msgpack.decode(buffer);
    console.log(`BODY: ${JSON.stringify(msg)}`);
  });
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

// write data to request body
req.write(data);
req.end();

