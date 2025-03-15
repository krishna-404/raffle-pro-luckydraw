-- Create a type for event input
CREATE TYPE public.event_input AS (
  name VARCHAR,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by_admin VARCHAR
);

-- Create a type for prize input
CREATE TYPE public.prize_input AS (
  name VARCHAR,
  description TEXT,
  seniority_index INTEGER,
  image_url TEXT
);

-- Create function to handle event creation with prizes in a transaction
CREATE OR REPLACE FUNCTION create_event_with_prizes(
  event_data event_input,
  prizes_data prize_input[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_prize_ids UUID[] := ARRAY[]::UUID[];
  v_prize_id UUID;
  v_prize prize_input;
  v_result JSON;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert event
    INSERT INTO events (
      name,
      description,
      start_date,
      end_date,
      created_by_admin
    )
    VALUES (
      event_data.name,
      event_data.description,
      event_data.start_date,
      event_data.end_date,
      event_data.created_by_admin
    )
    RETURNING id INTO v_event_id;

    -- Insert prizes
    FOREACH v_prize IN ARRAY prizes_data
    LOOP
      INSERT INTO prizes (
        event_id,
        name,
        description,
        seniority_index,
        image_url
      )
      VALUES (
        v_event_id,
        v_prize.name,
        v_prize.description,
        v_prize.seniority_index,
        v_prize.image_url
      )
      RETURNING id INTO v_prize_id;

      v_prize_ids := array_append(v_prize_ids, v_prize_id);
    END LOOP;

    -- Create JSON result
    SELECT json_build_object(
      'event_id', v_event_id,
      'prize_ids', v_prize_ids
    ) INTO v_result;

    RETURN v_result;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_event_with_prizes TO authenticated; 