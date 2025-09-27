with event_seed as (
  select *
  from (
    values
      (
        '0d3f4a9f-7b5a-4a83-8b30-9d9b2a19a0b1'::uuid,
        'テックカンファレンス 2025',
        '最新のテクノロジートレンドを学ぶカンファレンス。AI・機械学習・Web開発の最新動向を業界エキスパートが紹介します。',
        '2025-03-15'::date,
        '10:00',
        '東京国際フォーラム',
        'テクノロジー',
        500,
        234,
        true
      ),
      (
        '7ab2df7c-3d94-48dd-9e95-1f3d8f2fbc3d'::uuid,
        'デザインワークショップ',
        'UI/UX デザインの基礎を学ぶハンズオン形式のワークショップ。Figma を使ってユーザー中心のデザイン思考を体験します。',
        '2025-02-28'::date,
        '14:00',
        '渋谷クリエイティブセンター',
        'デザイン',
        30,
        18,
        true
      ),
      (
        '9f6c1ae4-58cc-4f7f-986d-7fb4c9f7de12'::uuid,
        'スタートアップピッチナイト',
        '国内外のスタートアップが最新プロダクトをピッチするネットワーキングイベント。投資家や先進企業との交流も可能です。',
        '2025-04-05'::date,
        '19:00',
        'WeWork 六本木',
        'ビジネス',
        150,
        72,
        true
      )
  ) as v (
    id,
    title,
    description,
    date,
    time,
    location,
    category,
    max_attendees,
    current_attendees,
    is_public
  )
)
insert into public.events (
  id,
  title,
  description,
  date,
  time,
  location,
  category,
  max_attendees,
  current_attendees,
  is_public
)
select
  id,
  title,
  description,
  date,
  time,
  location,
  category,
  max_attendees,
  current_attendees,
  is_public
from event_seed
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  date = excluded.date,
  time = excluded.time,
  location = excluded.location,
  category = excluded.category,
  max_attendees = excluded.max_attendees,
  current_attendees = excluded.current_attendees,
  is_public = excluded.is_public;

-- Seed data for event registrations (only inserts when target users exist)
with registration_seed as (
  select
    '2e15d4de-6f3f-4f63-8f78-4a6f274cd9a0'::uuid as id,
    '0d3f4a9f-7b5a-4a83-8b30-9d9b2a19a0b1'::uuid as event_id,
    u.id as user_id,
    '福山 貴也'::text as name,
    'thirties'::text as age_group,
    'manager'::text as occupation,
    'media'::text as discovery,
    '海外の登壇者情報をチェックしたいです。'::text as other
  from auth.users u
  where u.email = 'takanori.fukuyama@quantum-box.com'

  union all

  select
    '6f4e29fd-4802-4c3f-9e1a-2fd466a0e4cf'::uuid as id,
    '7ab2df7c-3d94-48dd-9e95-1f3d8f2fbc3d'::uuid as event_id,
    u.id as user_id,
    '川村 美織'::text as name,
    'twenties'::text as age_group,
    'designer'::text as occupation,
    'sns'::text as discovery,
    null::text as other
  from auth.users u
  where u.email = 'miomio.pooh.1224@gmail.com'

  union all

  select
    '9bce2d5e-9fa4-4d09-a6b2-d31b4d4ea22c'::uuid as id,
    '9f6c1ae4-58cc-4f7f-986d-7fb4c9f7de12'::uuid as event_id,
    u.id as user_id,
    '福山 貴也'::text as name,
    'forties'::text as age_group,
    'planner'::text as occupation,
    'friend'::text as discovery,
    '投資家として候補を探しています。'::text as other
  from auth.users u
  where u.email = 'takanori.fukuyama+1@quantum-box.com'
)
insert into public.event_registrations (
  id,
  event_id,
  user_id,
  name,
  age_group,
  occupation,
  discovery,
  other
)
select
  id,
  event_id,
  user_id,
  name,
  age_group,
  occupation,
  discovery,
  other
from registration_seed
where user_id is not null
on conflict (event_id, user_id) do update set
  name = excluded.name,
  age_group = excluded.age_group,
  occupation = excluded.occupation,
  discovery = excluded.discovery,
  other = excluded.other;
