// TODO - API request that fetches raw content from S3 and returns as JSON

export const handler = async (req: Request) => {
  // TODO implement S3 call
  return new Response(JSON.stringify({ message: 'Raw response' }), { headers: { 'Content-Type': 'application/json' } });
};