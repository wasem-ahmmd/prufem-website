-- Seed an initial active banner (replace values as needed)

insert into public.admin_banners (image, color, title, "isActive")
values (
  'https://res.cloudinary.com/arzoojatt/image/upload/v1234567890/banners/hero.jpg',
  '#50C878',
  'Luxury Emerald Collection',
  true
)
on conflict do nothing;