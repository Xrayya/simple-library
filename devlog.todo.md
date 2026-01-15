# Dev Log

## 2025-7-25

- [x] Initialize project from template
- [x] try deploy frontend to Vercel
- [x] try deploy backend to Cloudflare Workers
- [x] Setup backend repo
  - [x] setup supabase
  - [x] install drizzle
  - [x] setup drizzle with supabase
  - [x] setup db shcema (use schema fron database)
  - [x] setup validation middleware
- [x] First feature: register with email-password

## 2025-7-26

- [x] login with email and password; with cookie and header token setting and refresh token
  - [x] push db
  - [x] pas login kirim akses dan refresh token di payload dan juga set cookie
  - [x] auth middleware nangkep token dari cookie dan header sekaligus
- [x] endpoint refresh token
- [x] logout
- [x] test auth
  - [x] test login
  - [x] try to change access token expire time to 1m and see if it effect -> check // TODO
  - [x] test refresh token
  - [x] test logout
- [x] bangun frontend auth
  - [x] login page
  - [x] logout button
  - [x] try to change cookie and access token expire time to 1m and see if it effect
- [ ] setup trigger untuk updatedat
- [ ] {homework} cari tahu hapus token otomatis yang dah kadaluarsa

## 2025-8-7

- [x] implement register with email and password on frontend
- [x] implement login with email and password on frontend
  - [x] butuh cari tahu cara kirim cookie dari frontend ke backend -> potentially buat endpoint di utils hanya untuk membaca cookie
  - [x] butuh cari tahu cara untuk clean up cookie di frontend
- [x] implement refresh token on frontend
- [x] implement logout on frontend
- [ ] on production, use proper config for cookie setting in backend

## 2025-8-27
- [x] bedakan respons auth untuk web client dan non-web client


## 2026-1-15
- [x] mengimplementasikan auth-protected routes
