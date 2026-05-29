--
-- PostgreSQL database dump
--

\restrict 47mwbiguR1MLFx9p45JDQtYXaFWDGIkkTahtVRaFXcKbzu76nTN7V0WstyOeSSK

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: listing_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.listing_status AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE public.listing_status OWNER TO postgres;

--
-- Name: owner_request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.owner_request_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.owner_request_status OWNER TO postgres;

--
-- Name: force_email_lowercase(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.force_email_lowercase() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.email := LOWER(NEW.email);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.force_email_lowercase() OWNER TO postgres;

--
-- Name: force_listings_text_lowercase(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.force_listings_text_lowercase() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.title := LOWER(NEW.title);
    NEW.type  := LOWER(NEW.type);
    NEW.city  := LOWER(NEW.city);
    
    -- Handle the nullable 'area' column safely
    IF NEW.area IS NOT NULL THEN
        NEW.area := LOWER(NEW.area);
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.force_listings_text_lowercase() OWNER TO postgres;

--
-- Name: force_title_lowercase(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.force_title_lowercase() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.title := LOWER(NEW.title);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.force_title_lowercase() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    city text NOT NULL,
    area text,
    price numeric NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    owner_id integer NOT NULL,
    status public.listing_status DEFAULT 'draft'::public.listing_status NOT NULL,
    published_at timestamp without time zone,
    archived_at timestamp without time zone,
    CONSTRAINT archived_at_required CHECK ((((status = 'archived'::public.listing_status) AND (archived_at IS NOT NULL)) OR (status <> 'archived'::public.listing_status))),
    CONSTRAINT listings_price_check CHECK ((price > (0)::numeric)),
    CONSTRAINT listings_type_check CHECK ((type = ANY (ARRAY['room'::text, 'house'::text, 'apartment'::text, 'pg'::text, 'villa'::text, 'studio'::text]))),
    CONSTRAINT published_at_required CHECK ((((status = 'published'::public.listing_status) AND (published_at IS NOT NULL)) OR (status <> 'published'::public.listing_status)))
);


ALTER TABLE public.listings OWNER TO postgres;

--
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.listings_id_seq OWNER TO postgres;

--
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- Name: owner_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.owner_requests (
    id integer NOT NULL,
    user_id integer,
    status public.owner_request_status DEFAULT 'pending'::public.owner_request_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.owner_requests OWNER TO postgres;

--
-- Name: owner_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.owner_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_requests_id_seq OWNER TO postgres;

--
-- Name: owner_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.owner_requests_id_seq OWNED BY public.owner_requests.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['user'::text, 'owner'::text, 'admin'::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: listings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings ALTER COLUMN id SET DEFAULT nextval('public.listings_id_seq'::regclass);


--
-- Name: owner_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owner_requests ALTER COLUMN id SET DEFAULT nextval('public.owner_requests_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: owner_requests owner_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owner_requests
    ADD CONSTRAINT owner_requests_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_owner_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_owner_requests_status ON public.owner_requests USING btree (status);


--
-- Name: unique_pending_owner_request; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_pending_owner_request ON public.owner_requests USING btree (user_id) WHERE (status = 'pending'::public.owner_request_status);


--
-- Name: users trg_force_email_lowercase; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_force_email_lowercase BEFORE INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.force_email_lowercase();


--
-- Name: listings trg_force_listings_text_lowercase; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_force_listings_text_lowercase BEFORE INSERT OR UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.force_listings_text_lowercase();


--
-- Name: owner_requests fk_owner_request_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owner_requests
    ADD CONSTRAINT fk_owner_request_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: listings listings_owner_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_owner_fk FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 47mwbiguR1MLFx9p45JDQtYXaFWDGIkkTahtVRaFXcKbzu76nTN7V0WstyOeSSK

