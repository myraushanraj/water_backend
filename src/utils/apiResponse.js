export function success(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function fail(res, message = 'Something went wrong', status = 400, details = undefined) {
  return res.status(status).json({ success: false, message, details });
} 