export const api = {
  get: async (url) => (await fetch(url)).json(),
  post: async (url, body) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }),
  patch: async (url, body) => fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }),
  del: async (url) => fetch(url, { method: 'DELETE' })
};