# Backend (Express + MongoDB)

## Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `POST /api/orders` (auth)
- `GET /api/orders/me` (auth)
- `GET /api/orders` (admin)
- `PUT /api/orders/:id/status` (admin)
- `POST /api/orders/:id/refund` (admin)
- `GET /api/admin/dashboard` (admin)
- `GET /api/admin/customers` (admin)

JWT is stored in httpOnly cookie `token`. 