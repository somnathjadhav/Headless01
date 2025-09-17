export default function handler(req, res) {
  // WordPress preview endpoint
  // This will handle preview requests from WordPress admin
  res.status(200).json({ message: 'Preview endpoint' })
}
