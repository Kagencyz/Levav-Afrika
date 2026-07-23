// Stub for superjson - used for static deployment where tRPC backend doesn't run
export default {
  serialize: (obj: any) => JSON.stringify(obj),
  deserialize: (str: string) => JSON.parse(str),
};
