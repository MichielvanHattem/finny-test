
const origWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk,enc,cb)=>{
  if(chunk.toString().startsWith('Warning: TT:')) return true;
  return origWrite(chunk,enc,cb);
};
// placeholder parser
module.exports.parseFile = async()=>[];
