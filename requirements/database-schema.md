Table admin_users {
  email varchar [primary key]
  password varchar [not null]
  qr_codes qr_codes
  events events
}

Ref: events.created_by_admin > admin_users.email
Table events {
  id uuid [primary key]
  created_by_admin varchar [not null]
  name varchar [not null]
  description text
  start_date date [not null, unique]
  end_date date [not null, unique]
  prizes prizes
}

Ref: prizes.event_id > events.id
Table prizes {
  id uuid [primary key]
  event_id uuid
  seniority_index integer [not null]
  name varchar [not null]
  description text
  image_url text
}


Ref: event_entries.event_id > events.id
Ref: event_entries.prize_id - prizes.id
Ref: event_entries.qr_code_id - qr_codes.id
Table event_entries {
  id string [primary key]
  address text [not null]
  city varchar [not null]
  email varchar
  event_id uuid [not null]
  name varchar [not null]
  pincode integer [not null]
  prize_id uuid
  qr_code_id uuid
  request_ip_address varchar [not null]
  request_user_agent text [not null]
  whatsapp_number integer [not null]
}

Ref: qr_codes.created_by_admin > admin_users.email
Table qr_codes {
  id uuid [primary key]
  created_by_admin varchar
  expires_at timestamp
}