insert into storage.buckets (
  id,
  name,
  public
)
values (
  'business-images',
  'business-images',
  true
)
on conflict (id) do nothing;