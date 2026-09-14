insert into public.businesses (
  owner_id,
  name,
  slug,
  description,
  category,
  address,
  status
)
select
  id,
  'Nomad Coffee',
  'nomad-coffee',
  'A local coffee shop in Batac serving coffee and creating a relaxed space for the community.',
  'FOOD_AND_DRINK',
  'Palpalicong, City of Batac, Ilocos Norte',
  'APPROVED'
from public.profiles
limit 1;