-- Will delete all the data form all the tables
TRUNCATE TABLE
  order_items,
  ongoing_table_orders,
  restaurant_order,
  waiter,
  menu_item,
  menu_category,
  restaurant_address,
  restaurant,
  business,
  device
CASCADE;


-- Will delete all the tables and all the contents in them
DO
$do$
DECLARE
   r RECORD;
BEGIN
   FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
      EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
   END LOOP;
END
$do$;

-- Will delete all the enums
DO $$
DECLARE
  enum_record RECORD;
BEGIN
  FOR enum_record IN SELECT n.nspname as schema, t.typname as type
                     FROM pg_type t 
                     LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                     WHERE (t.typtype = 'e')
  LOOP
    EXECUTE 'DROP TYPE IF EXISTS ' || enum_record.schema || '.' || enum_record.type || ' CASCADE';
    RAISE NOTICE 'Dropped enum type: %', enum_record.schema || '.' || enum_record.type;
  END LOOP;
END$$;

-- Will delete all the extensions
DO $$
DECLARE
  ext_record RECORD;
BEGIN
  FOR ext_record IN SELECT extname FROM pg_extension
  LOOP
    EXECUTE 'DROP EXTENSION IF EXISTS "' || ext_record.extname || '" CASCADE';
    RAISE NOTICE 'Dropped extension: %', ext_record.extname;
  END LOOP;
END$$;
