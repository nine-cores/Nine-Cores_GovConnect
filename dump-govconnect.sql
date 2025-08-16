--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2
-- Dumped by pg_dump version 13.2

-- Started on 2025-08-16 19:23:21

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 3256 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 760 (class 1247 OID 1481397)
-- Name: certificate_requests_certificate_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.certificate_requests_certificate_type_enum AS ENUM (
    'character',
    'residence',
    'birth_verification'
);


ALTER TYPE public.certificate_requests_certificate_type_enum OWNER TO postgres;

--
-- TOC entry 763 (class 1247 OID 1481404)
-- Name: certificate_requests_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.certificate_requests_status_enum AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'rejected',
    'cancelled'
);


ALTER TYPE public.certificate_requests_status_enum OWNER TO postgres;

--
-- TOC entry 753 (class 1247 OID 1481374)
-- Name: citizen_otps_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.citizen_otps_status_enum AS ENUM (
    'Pending',
    'Verified',
    'Expired',
    'Used'
);


ALTER TYPE public.citizen_otps_status_enum OWNER TO postgres;

--
-- TOC entry 750 (class 1247 OID 1481366)
-- Name: citizen_otps_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.citizen_otps_type_enum AS ENUM (
    'Login',
    'PasswordReset',
    'EmailVerification'
);


ALTER TYPE public.citizen_otps_type_enum OWNER TO postgres;

--
-- TOC entry 743 (class 1247 OID 1481346)
-- Name: citizen_sessions_login_method_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.citizen_sessions_login_method_enum AS ENUM (
    'Password',
    'OTP'
);


ALTER TYPE public.citizen_sessions_login_method_enum OWNER TO postgres;

--
-- TOC entry 740 (class 1247 OID 1481338)
-- Name: citizen_sessions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.citizen_sessions_status_enum AS ENUM (
    'Active',
    'Expired',
    'Revoked'
);


ALTER TYPE public.citizen_sessions_status_enum OWNER TO postgres;

--
-- TOC entry 718 (class 1247 OID 1481274)
-- Name: citizens_account_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.citizens_account_status_enum AS ENUM (
    'Active',
    'Inactive',
    'Suspended'
);


ALTER TYPE public.citizens_account_status_enum OWNER TO postgres;

--
-- TOC entry 712 (class 1247 OID 1481258)
-- Name: citizens_gender_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.citizens_gender_enum AS ENUM (
    'Male',
    'Female',
    'Other'
);


ALTER TYPE public.citizens_gender_enum OWNER TO postgres;

--
-- TOC entry 715 (class 1247 OID 1481266)
-- Name: citizens_verification_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.citizens_verification_status_enum AS ENUM (
    'Pending',
    'Verified',
    'Rejected'
);


ALTER TYPE public.citizens_verification_status_enum OWNER TO postgres;

--
-- TOC entry 733 (class 1247 OID 1481316)
-- Name: documents_document_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.documents_document_type_enum AS ENUM (
    'BirthCertificate',
    'Policereport',
    'NIC',
    'Other'
);


ALTER TYPE public.documents_document_type_enum OWNER TO postgres;

--
-- TOC entry 660 (class 1247 OID 1481123)
-- Name: gn_appointments_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gn_appointments_status_enum AS ENUM (
    'Pending',
    'Confirmed',
    'Completed',
    'Cancelled'
);


ALTER TYPE public.gn_appointments_status_enum OWNER TO postgres;

--
-- TOC entry 692 (class 1247 OID 1481203)
-- Name: gn_availability_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gn_availability_status_enum AS ENUM (
    'Available',
    'Booked',
    'Cancelled'
);


ALTER TYPE public.gn_availability_status_enum OWNER TO postgres;

--
-- TOC entry 678 (class 1247 OID 1481169)
-- Name: mt_appointments_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mt_appointments_status_enum AS ENUM (
    'Pending',
    'Confirmed',
    'Completed',
    'Cancelled'
);


ALTER TYPE public.mt_appointments_status_enum OWNER TO postgres;

--
-- TOC entry 671 (class 1247 OID 1481152)
-- Name: mt_availability_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mt_availability_status_enum AS ENUM (
    'Available',
    'Booked',
    'Cancelled'
);


ALTER TYPE public.mt_availability_status_enum OWNER TO postgres;

--
-- TOC entry 702 (class 1247 OID 1481226)
-- Name: users_account_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_account_status_enum AS ENUM (
    'Active',
    'Inactive',
    'Suspended'
);


ALTER TYPE public.users_account_status_enum OWNER TO postgres;

--
-- TOC entry 699 (class 1247 OID 1481219)
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'GN',
    'Staff-MT',
    'Admin'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- TOC entry 725 (class 1247 OID 1481296)
-- Name: verifications_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.verifications_status_enum AS ENUM (
    'Pending',
    'Verified',
    'Rejected'
);


ALTER TYPE public.verifications_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 1481415)
-- Name: certificate_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certificate_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    citizen_nic character varying(12) NOT NULL,
    certificate_type public.certificate_requests_certificate_type_enum NOT NULL,
    purpose character varying(255) NOT NULL,
    personal_details json NOT NULL,
    documents json NOT NULL,
    appointment_id character varying,
    status public.certificate_requests_status_enum DEFAULT 'pending'::public.certificate_requests_status_enum NOT NULL,
    notes text,
    rejection_reason text,
    processed_by character varying,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "citizenNic" character varying(12),
    "appointmentId" integer
);


ALTER TABLE public.certificate_requests OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 1481383)
-- Name: citizen_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.citizen_otps (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    citizen_nic character varying(12) NOT NULL,
    otp_code character varying(6) NOT NULL,
    type public.citizen_otps_type_enum NOT NULL,
    status public.citizen_otps_status_enum DEFAULT 'Pending'::public.citizen_otps_status_enum NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    verified_at timestamp without time zone,
    ip_address character varying(45),
    user_agent text,
    attempt_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.citizen_otps OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 1481351)
-- Name: citizen_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.citizen_sessions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    citizen_nic character varying(12) NOT NULL,
    refresh_token text NOT NULL,
    status public.citizen_sessions_status_enum DEFAULT 'Active'::public.citizen_sessions_status_enum NOT NULL,
    login_method public.citizen_sessions_login_method_enum NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    ip_address character varying(45),
    user_agent text,
    last_used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.citizen_sessions OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 1481281)
-- Name: citizens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.citizens (
    nic character varying(12) NOT NULL,
    display_name character varying(100) NOT NULL,
    phone_number character varying(15) NOT NULL,
    email character varying(100),
    gender public.citizens_gender_enum NOT NULL,
    password_hash character varying(255),
    verification_status public.citizens_verification_status_enum DEFAULT 'Pending'::public.citizens_verification_status_enum NOT NULL,
    verification_date timestamp without time zone,
    address text,
    division_id character varying(6),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    account_status public.citizens_account_status_enum DEFAULT 'Active'::public.citizens_account_status_enum NOT NULL
);


ALTER TABLE public.citizens OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 1481248)
-- Name: divisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.divisions (
    division_id character varying(6) NOT NULL,
    division_name character varying(100) NOT NULL,
    gn_user_id character varying(6),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.divisions OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 1481325)
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    citizen_nic character varying(12) NOT NULL,
    document_type public.documents_document_type_enum DEFAULT 'Other'::public.documents_document_type_enum NOT NULL,
    original_name character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    mime_type character varying(50) NOT NULL,
    file_size bigint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "citizenNic" character varying(12)
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 1481133)
-- Name: gn_appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gn_appointments (
    gn_appointment_id integer NOT NULL,
    citizen_nic character varying(12) NOT NULL,
    user_id character varying(10) NOT NULL,
    gn_service_id character varying(10) NOT NULL,
    appointment_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    purpose character varying(255),
    status public.gn_appointments_status_enum DEFAULT 'Pending'::public.gn_appointments_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gn_appointments OWNER TO postgres;

--
-- TOC entry 203 (class 1259 OID 1481131)
-- Name: gn_appointments_gn_appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gn_appointments_gn_appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gn_appointments_gn_appointment_id_seq OWNER TO postgres;

--
-- TOC entry 3257 (class 0 OID 0)
-- Dependencies: 203
-- Name: gn_appointments_gn_appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gn_appointments_gn_appointment_id_seq OWNED BY public.gn_appointments.gn_appointment_id;


--
-- TOC entry 213 (class 1259 OID 1481211)
-- Name: gn_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gn_availability (
    gn_availability_id integer NOT NULL,
    user_id character varying(10) NOT NULL,
    available_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    status public.gn_availability_status_enum DEFAULT 'Available'::public.gn_availability_status_enum NOT NULL,
    gn_appointment_id integer
);


ALTER TABLE public.gn_availability OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 1481209)
-- Name: gn_availability_gn_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gn_availability_gn_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gn_availability_gn_availability_id_seq OWNER TO postgres;

--
-- TOC entry 3258 (class 0 OID 0)
-- Dependencies: 212
-- Name: gn_availability_gn_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gn_availability_gn_availability_id_seq OWNED BY public.gn_availability.gn_availability_id;


--
-- TOC entry 205 (class 1259 OID 1481142)
-- Name: gn_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gn_services (
    gn_service_id character varying(6) NOT NULL,
    service_name character varying(100) NOT NULL,
    description text,
    is_enabled boolean DEFAULT false NOT NULL,
    service_unit_id character varying(10)
);


ALTER TABLE public.gn_services OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 1481113)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 201 (class 1259 OID 1481111)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- TOC entry 3259 (class 0 OID 0)
-- Dependencies: 201
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 209 (class 1259 OID 1481179)
-- Name: mt_appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mt_appointments (
    mt_appointment_id integer NOT NULL,
    citizen_nic character varying(12) NOT NULL,
    user_id character varying(10) NOT NULL,
    mt_service_id character varying(10) NOT NULL,
    appointment_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    purpose character varying(255),
    status public.mt_appointments_status_enum DEFAULT 'Pending'::public.mt_appointments_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mt_appointments OWNER TO postgres;

--
-- TOC entry 208 (class 1259 OID 1481177)
-- Name: mt_appointments_mt_appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mt_appointments_mt_appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mt_appointments_mt_appointment_id_seq OWNER TO postgres;

--
-- TOC entry 3260 (class 0 OID 0)
-- Dependencies: 208
-- Name: mt_appointments_mt_appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mt_appointments_mt_appointment_id_seq OWNED BY public.mt_appointments.mt_appointment_id;


--
-- TOC entry 207 (class 1259 OID 1481161)
-- Name: mt_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mt_availability (
    mt_availability_id integer NOT NULL,
    user_id character varying(10) NOT NULL,
    mt_service_id character varying(10) NOT NULL,
    available_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    status public.mt_availability_status_enum DEFAULT 'Available'::public.mt_availability_status_enum NOT NULL
);


ALTER TABLE public.mt_availability OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 1481159)
-- Name: mt_availability_mt_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mt_availability_mt_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mt_availability_mt_availability_id_seq OWNER TO postgres;

--
-- TOC entry 3261 (class 0 OID 0)
-- Dependencies: 206
-- Name: mt_availability_mt_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mt_availability_mt_availability_id_seq OWNED BY public.mt_availability.mt_availability_id;


--
-- TOC entry 210 (class 1259 OID 1481188)
-- Name: mt_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mt_services (
    mt_service_id character varying(10) NOT NULL,
    service_name character varying(100) NOT NULL,
    description text,
    is_enabled boolean DEFAULT false NOT NULL,
    service_unit_id character varying(10)
);


ALTER TABLE public.mt_services OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 1481197)
-- Name: service_units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_units (
    service_unit_id character varying(10) NOT NULL,
    service_unit_name character varying(100) NOT NULL
);


ALTER TABLE public.service_units OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 1481233)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id character varying(10) NOT NULL,
    nic character varying(12),
    display_name character varying(100) NOT NULL,
    phone_number character varying(15) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.users_role_enum NOT NULL,
    service_unit_id character varying(10),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    account_status public.users_account_status_enum DEFAULT 'Active'::public.users_account_status_enum NOT NULL,
    last_login_at timestamp without time zone,
    refresh_token character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 1481305)
-- Name: verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verifications (
    verification_id integer NOT NULL,
    citizen_nic character varying(12) NOT NULL,
    grama_niladhari_id character varying(10) NOT NULL,
    status public.verifications_status_enum DEFAULT 'Pending'::public.verifications_status_enum NOT NULL,
    verification_date timestamp without time zone,
    comments text
);


ALTER TABLE public.verifications OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 1481303)
-- Name: verifications_verification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.verifications_verification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.verifications_verification_id_seq OWNER TO postgres;

--
-- TOC entry 3262 (class 0 OID 0)
-- Dependencies: 217
-- Name: verifications_verification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.verifications_verification_id_seq OWNED BY public.verifications.verification_id;


--
-- TOC entry 2993 (class 2604 OID 1481136)
-- Name: gn_appointments gn_appointment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_appointments ALTER COLUMN gn_appointment_id SET DEFAULT nextval('public.gn_appointments_gn_appointment_id_seq'::regclass);


--
-- TOC entry 3005 (class 2604 OID 1481214)
-- Name: gn_availability gn_availability_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_availability ALTER COLUMN gn_availability_id SET DEFAULT nextval('public.gn_availability_gn_availability_id_seq'::regclass);


--
-- TOC entry 2992 (class 2604 OID 1481116)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 3000 (class 2604 OID 1481182)
-- Name: mt_appointments mt_appointment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_appointments ALTER COLUMN mt_appointment_id SET DEFAULT nextval('public.mt_appointments_mt_appointment_id_seq'::regclass);


--
-- TOC entry 2998 (class 2604 OID 1481164)
-- Name: mt_availability mt_availability_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_availability ALTER COLUMN mt_availability_id SET DEFAULT nextval('public.mt_availability_mt_availability_id_seq'::regclass);


--
-- TOC entry 3016 (class 2604 OID 1481308)
-- Name: verifications verification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verifications ALTER COLUMN verification_id SET DEFAULT nextval('public.verifications_verification_id_seq'::regclass);


--
-- TOC entry 3250 (class 0 OID 1481415)
-- Dependencies: 222
-- Data for Name: certificate_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certificate_requests (id, citizen_nic, certificate_type, purpose, personal_details, documents, appointment_id, status, notes, rejection_reason, processed_by, processed_at, created_at, updated_at, "citizenNic", "appointmentId") FROM stdin;
\.


--
-- TOC entry 3249 (class 0 OID 1481383)
-- Dependencies: 221
-- Data for Name: citizen_otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.citizen_otps (id, citizen_nic, otp_code, type, status, expires_at, verified_at, ip_address, user_agent, attempt_count, created_at) FROM stdin;
\.


--
-- TOC entry 3248 (class 0 OID 1481351)
-- Dependencies: 220
-- Data for Name: citizen_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.citizen_sessions (id, citizen_nic, refresh_token, status, login_method, expires_at, ip_address, user_agent, last_used_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3244 (class 0 OID 1481281)
-- Dependencies: 216
-- Data for Name: citizens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.citizens (nic, display_name, phone_number, email, gender, password_hash, verification_status, verification_date, address, division_id, created_at, updated_at, account_status) FROM stdin;
\.


--
-- TOC entry 3243 (class 0 OID 1481248)
-- Dependencies: 215
-- Data for Name: divisions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.divisions (division_id, division_name, gn_user_id, created_at, updated_at) FROM stdin;
DIV004	Jaffna East	\N	2025-08-16 19:21:35.504759	2025-08-16 19:21:35.504759
DIV005	Kurunegala West	\N	2025-08-16 19:21:35.508593	2025-08-16 19:21:35.508593
DIV001	Colombo Central	GN0001	2025-08-16 19:21:35.48738	2025-08-16 19:21:36.112471
DIV002	Kandy North	GN0002	2025-08-16 19:21:35.492848	2025-08-16 19:21:36.128904
DIV003	Galle South	GN0003	2025-08-16 19:21:35.499614	2025-08-16 19:21:36.133156
\.


--
-- TOC entry 3247 (class 0 OID 1481325)
-- Dependencies: 219
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, citizen_nic, document_type, original_name, file_name, file_path, mime_type, file_size, created_at, updated_at, "citizenNic") FROM stdin;
\.


--
-- TOC entry 3232 (class 0 OID 1481133)
-- Dependencies: 204
-- Data for Name: gn_appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gn_appointments (gn_appointment_id, citizen_nic, user_id, gn_service_id, appointment_date, start_time, end_time, purpose, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3241 (class 0 OID 1481211)
-- Dependencies: 213
-- Data for Name: gn_availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gn_availability (gn_availability_id, user_id, available_date, start_time, end_time, status, gn_appointment_id) FROM stdin;
\.


--
-- TOC entry 3233 (class 0 OID 1481142)
-- Dependencies: 205
-- Data for Name: gn_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gn_services (gn_service_id, service_name, description, is_enabled, service_unit_id) FROM stdin;
GNS001	Identity Verification	Verify citizen identity for official documents	t	SU001
GNS002	Address Verification	Verify citizen residential address	t	SU001
GNS003	Character Certificate	Issue character certificate for employment	t	SU001
GNS004	Income Certificate	Issue income certificate for various purposes	f	SU001
\.


--
-- TOC entry 3230 (class 0 OID 1481113)
-- Dependencies: 202
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1755350160251	New1755350160251
\.


--
-- TOC entry 3237 (class 0 OID 1481179)
-- Dependencies: 209
-- Data for Name: mt_appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mt_appointments (mt_appointment_id, citizen_nic, user_id, mt_service_id, appointment_date, start_time, end_time, purpose, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3235 (class 0 OID 1481161)
-- Dependencies: 207
-- Data for Name: mt_availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mt_availability (mt_availability_id, user_id, mt_service_id, available_date, start_time, end_time, status) FROM stdin;
\.


--
-- TOC entry 3238 (class 0 OID 1481188)
-- Dependencies: 210
-- Data for Name: mt_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mt_services (mt_service_id, service_name, description, is_enabled, service_unit_id) FROM stdin;
MTS001	Driving License Application	Apply for new driving license	t	SU002
MTS002	License Renewal	Renew existing driving license	t	SU002
MTS003	Vehicle Registration	Register new vehicle	t	SU002
MTS004	Revenue License	Apply for vehicle revenue license	f	SU002
\.


--
-- TOC entry 3239 (class 0 OID 1481197)
-- Dependencies: 211
-- Data for Name: service_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_units (service_unit_id, service_unit_name) FROM stdin;
SU001	Grama Niladhari Office
SU002	Motor Traffic Service Unit
SU003	Registrar of Persons Service Unit
SU004	Immigration Service Unit
\.


--
-- TOC entry 3242 (class 0 OID 1481233)
-- Dependencies: 214
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, nic, display_name, phone_number, email, password_hash, role, service_unit_id, created_at, updated_at, account_status, last_login_at, refresh_token) FROM stdin;
ADM001	\N	System Administrator	+94771234567	admin@example.com	$2b$10$dsASOxi46xREpEkzGrfEz.XLEpJ.mrBBS7SVAGaPrZTcA8zVCJ6my	Admin	\N	2025-08-16 19:21:35.348892	2025-08-16 19:21:35.348892	Active	\N	\N
GN0001	\N	Rajesh Kumar	+94771234567	rajesh.gn@gov.lk	$2b$10$rRV8lLoP44b3Kn8PXYx1jeEdF7Q0Jz0SOd7ZLV5cvCkUGWhnpLRYC	GN	\N	2025-08-16 19:21:35.581189	2025-08-16 19:21:35.581189	Active	\N	\N
GN0002	\N	Priya Fernando	+94772345678	priya.gn@gov.lk	$2b$10$XvbSTDyRoTRkoKFy86Wlkedy4NYlmLw4qPsaR7ckqbQcK3qQviEN6	GN	\N	2025-08-16 19:21:35.687278	2025-08-16 19:21:35.687278	Active	\N	\N
GN0003	\N	Nuwan Jayasinghe	+94775555555	nuwan.gn@gov.lk	$2b$10$ZNabjcCGyEOVp60ZoBv6IOozxGTE7WEoUYDtw0xdJKe6paym280Qm	GN	\N	2025-08-16 19:21:35.792895	2025-08-16 19:21:35.792895	Active	\N	\N
MT0001	\N	Sunil Perera	+94773456789	sunil.mt@gov.lk	$2b$10$qNw0yvTONDAkMD45bWWQxut7qZl4xsJDVboEO9Txyqwe51p1ok2UK	Staff-MT	SU002	2025-08-16 19:21:35.898456	2025-08-16 19:21:35.898456	Active	\N	\N
MT0002	\N	Kamala Silva	+94774567890	kamala.mt@gov.lk	$2b$10$txkc1GauS8V6fxgrOBiBNecbSeQ5.6Bd4tgmPH1NETE6cBxlPUnwi	Staff-MT	SU002	2025-08-16 19:21:36.003977	2025-08-16 19:21:36.003977	Active	\N	\N
\.


--
-- TOC entry 3246 (class 0 OID 1481305)
-- Dependencies: 218
-- Data for Name: verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verifications (verification_id, citizen_nic, grama_niladhari_id, status, verification_date, comments) FROM stdin;
\.


--
-- TOC entry 3263 (class 0 OID 0)
-- Dependencies: 203
-- Name: gn_appointments_gn_appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gn_appointments_gn_appointment_id_seq', 1, false);


--
-- TOC entry 3264 (class 0 OID 0)
-- Dependencies: 212
-- Name: gn_availability_gn_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gn_availability_gn_availability_id_seq', 1, false);


--
-- TOC entry 3265 (class 0 OID 0)
-- Dependencies: 201
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, true);


--
-- TOC entry 3266 (class 0 OID 0)
-- Dependencies: 208
-- Name: mt_appointments_mt_appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mt_appointments_mt_appointment_id_seq', 1, false);


--
-- TOC entry 3267 (class 0 OID 0)
-- Dependencies: 206
-- Name: mt_availability_mt_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mt_availability_mt_availability_id_seq', 1, false);


--
-- TOC entry 3268 (class 0 OID 0)
-- Dependencies: 217
-- Name: verifications_verification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.verifications_verification_id_seq', 1, false);


--
-- TOC entry 3074 (class 2606 OID 1481394)
-- Name: citizen_otps PK_28a3df1244c57d39a575d26d2e0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citizen_otps
    ADD CONSTRAINT "PK_28a3df1244c57d39a575d26d2e0" PRIMARY KEY (id);


--
-- TOC entry 3061 (class 2606 OID 1481292)
-- Name: citizens PK_613cfcd57c65d9908f0ddd5e70b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citizens
    ADD CONSTRAINT "PK_613cfcd57c65d9908f0ddd5e70b" PRIMARY KEY (nic);


--
-- TOC entry 3041 (class 2606 OID 1481167)
-- Name: mt_availability PK_67a60d490329ea9f772a30ee743; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_availability
    ADD CONSTRAINT "PK_67a60d490329ea9f772a30ee743" PRIMARY KEY (mt_availability_id);


--
-- TOC entry 3076 (class 2606 OID 1481426)
-- Name: certificate_requests PK_69c63a8245ee8787a471cce003f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_requests
    ADD CONSTRAINT "PK_69c63a8245ee8787a471cce003f" PRIMARY KEY (id);


--
-- TOC entry 3045 (class 2606 OID 1481196)
-- Name: mt_services PK_74c1e4411abc6a2f5ffb363d30d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_services
    ADD CONSTRAINT "PK_74c1e4411abc6a2f5ffb363d30d" PRIMARY KEY (mt_service_id);


--
-- TOC entry 3035 (class 2606 OID 1481121)
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- TOC entry 3051 (class 2606 OID 1481243)
-- Name: users PK_96aac72f1574b88752e9fb00089; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY (user_id);


--
-- TOC entry 3039 (class 2606 OID 1481150)
-- Name: gn_services PK_977443d8b76f884170d01e21961; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_services
    ADD CONSTRAINT "PK_977443d8b76f884170d01e21961" PRIMARY KEY (gn_service_id);


--
-- TOC entry 3065 (class 2606 OID 1481314)
-- Name: verifications PK_985585dfa483581fc8486501bad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT "PK_985585dfa483581fc8486501bad" PRIMARY KEY (verification_id);


--
-- TOC entry 3057 (class 2606 OID 1481254)
-- Name: divisions PK_a2c7883153990aa6ce8fa8bbfc4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT "PK_a2c7883153990aa6ce8fa8bbfc4" PRIMARY KEY (division_id);


--
-- TOC entry 3071 (class 2606 OID 1481362)
-- Name: citizen_sessions PK_a796e46ee4f281f33d0e17788ad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citizen_sessions
    ADD CONSTRAINT "PK_a796e46ee4f281f33d0e17788ad" PRIMARY KEY (id);


--
-- TOC entry 3067 (class 2606 OID 1481336)
-- Name: documents PK_ac51aa5181ee2036f5ca482857c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY (id);


--
-- TOC entry 3049 (class 2606 OID 1481217)
-- Name: gn_availability PK_b8dd8dd1900e47fce17cbfc02ef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_availability
    ADD CONSTRAINT "PK_b8dd8dd1900e47fce17cbfc02ef" PRIMARY KEY (gn_availability_id);


--
-- TOC entry 3043 (class 2606 OID 1481187)
-- Name: mt_appointments PK_baf8afe9260ec16e8b6afd32be9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_appointments
    ADD CONSTRAINT "PK_baf8afe9260ec16e8b6afd32be9" PRIMARY KEY (mt_appointment_id);


--
-- TOC entry 3037 (class 2606 OID 1481141)
-- Name: gn_appointments PK_bce5fc668265227386c50eb9c23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_appointments
    ADD CONSTRAINT "PK_bce5fc668265227386c50eb9c23" PRIMARY KEY (gn_appointment_id);


--
-- TOC entry 3047 (class 2606 OID 1481201)
-- Name: service_units PK_f547e63aecd2e869caa734f7849; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_units
    ADD CONSTRAINT "PK_f547e63aecd2e869caa734f7849" PRIMARY KEY (service_unit_id);


--
-- TOC entry 3059 (class 2606 OID 1481256)
-- Name: divisions REL_4a95201c600f8153bb6730168e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT "REL_4a95201c600f8153bb6730168e" UNIQUE (gn_user_id);


--
-- TOC entry 3053 (class 2606 OID 1481245)
-- Name: users UQ_6988f854629846c6a59c749dab9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_6988f854629846c6a59c749dab9" UNIQUE (nic);


--
-- TOC entry 3055 (class 2606 OID 1481247)
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- TOC entry 3063 (class 2606 OID 1481294)
-- Name: citizens UQ_f419beb584c5bdd57652049bdad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citizens
    ADD CONSTRAINT "UQ_f419beb584c5bdd57652049bdad" UNIQUE (email);


--
-- TOC entry 3068 (class 1259 OID 1481363)
-- Name: IDX_929b7c097ef98aab7e4f340960; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_929b7c097ef98aab7e4f340960" ON public.citizen_sessions USING btree (refresh_token);


--
-- TOC entry 3069 (class 1259 OID 1481364)
-- Name: IDX_a94a7839991ab079ecc84ff9fc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a94a7839991ab079ecc84ff9fc" ON public.citizen_sessions USING btree (citizen_nic, status);


--
-- TOC entry 3072 (class 1259 OID 1481395)
-- Name: IDX_d646bc3e264c8987a53c934ff1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d646bc3e264c8987a53c934ff1" ON public.citizen_otps USING btree (citizen_nic, type, status);


--
-- TOC entry 3086 (class 2606 OID 1481472)
-- Name: mt_services FK_0ed9e094e6d2ae124a93b5c17e3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_services
    ADD CONSTRAINT "FK_0ed9e094e6d2ae124a93b5c17e3" FOREIGN KEY (service_unit_id) REFERENCES public.service_units(service_unit_id);


--
-- TOC entry 3097 (class 2606 OID 1481527)
-- Name: certificate_requests FK_0f2b438818865a077b633a8b753; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_requests
    ADD CONSTRAINT "FK_0f2b438818865a077b633a8b753" FOREIGN KEY ("citizenNic") REFERENCES public.citizens(nic) ON DELETE CASCADE;


--
-- TOC entry 3084 (class 2606 OID 1481462)
-- Name: mt_appointments FK_107f7937786ace0713fd7778779; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_appointments
    ADD CONSTRAINT "FK_107f7937786ace0713fd7778779" FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3092 (class 2606 OID 1481502)
-- Name: verifications FK_23fbda3a4bc2eb462fb5d30a60e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT "FK_23fbda3a4bc2eb462fb5d30a60e" FOREIGN KEY (citizen_nic) REFERENCES public.citizens(nic);


--
-- TOC entry 3077 (class 2606 OID 1481427)
-- Name: gn_appointments FK_37cdba038e7c2718300dc6a6915; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_appointments
    ADD CONSTRAINT "FK_37cdba038e7c2718300dc6a6915" FOREIGN KEY (citizen_nic) REFERENCES public.citizens(nic);


--
-- TOC entry 3094 (class 2606 OID 1481512)
-- Name: documents FK_3e9dee388feb98342e57e3b1bc1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "FK_3e9dee388feb98342e57e3b1bc1" FOREIGN KEY ("citizenNic") REFERENCES public.citizens(nic) ON DELETE CASCADE;


--
-- TOC entry 3079 (class 2606 OID 1481437)
-- Name: gn_appointments FK_4194fd41cb07e4310ef113cc457; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_appointments
    ADD CONSTRAINT "FK_4194fd41cb07e4310ef113cc457" FOREIGN KEY (gn_service_id) REFERENCES public.gn_services(gn_service_id);


--
-- TOC entry 3096 (class 2606 OID 1481522)
-- Name: citizen_otps FK_4663fcdbb8ca932e4a28ef8aac3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citizen_otps
    ADD CONSTRAINT "FK_4663fcdbb8ca932e4a28ef8aac3" FOREIGN KEY (citizen_nic) REFERENCES public.citizens(nic);


--
-- TOC entry 3090 (class 2606 OID 1481492)
-- Name: divisions FK_4a95201c600f8153bb6730168e2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT "FK_4a95201c600f8153bb6730168e2" FOREIGN KEY (gn_user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3078 (class 2606 OID 1481432)
-- Name: gn_appointments FK_8a46b2a09b15238ec1ec7abe812; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_appointments
    ADD CONSTRAINT "FK_8a46b2a09b15238ec1ec7abe812" FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3093 (class 2606 OID 1481507)
-- Name: verifications FK_985520cf554cf323f1fe365cd38; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT "FK_985520cf554cf323f1fe365cd38" FOREIGN KEY (grama_niladhari_id) REFERENCES public.users(user_id);


--
-- TOC entry 3087 (class 2606 OID 1481477)
-- Name: gn_availability FK_a262595b15579e75ecf6bfcc32a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_availability
    ADD CONSTRAINT "FK_a262595b15579e75ecf6bfcc32a" FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3098 (class 2606 OID 1481532)
-- Name: certificate_requests FK_ac88455c94ab00d513f20ff97fd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certificate_requests
    ADD CONSTRAINT "FK_ac88455c94ab00d513f20ff97fd" FOREIGN KEY ("appointmentId") REFERENCES public.gn_appointments(gn_appointment_id);


--
-- TOC entry 3088 (class 2606 OID 1481482)
-- Name: gn_availability FK_b32767d3c6b974377254d852f3a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_availability
    ADD CONSTRAINT "FK_b32767d3c6b974377254d852f3a" FOREIGN KEY (gn_appointment_id) REFERENCES public.gn_appointments(gn_appointment_id);


--
-- TOC entry 3083 (class 2606 OID 1481457)
-- Name: mt_appointments FK_b5d9ea58691891e6f2b92d9eb53; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_appointments
    ADD CONSTRAINT "FK_b5d9ea58691891e6f2b92d9eb53" FOREIGN KEY (citizen_nic) REFERENCES public.citizens(nic);


--
-- TOC entry 3095 (class 2606 OID 1481517)
-- Name: citizen_sessions FK_bb7c5c8d1e2cb97504b3d6c0e92; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citizen_sessions
    ADD CONSTRAINT "FK_bb7c5c8d1e2cb97504b3d6c0e92" FOREIGN KEY (citizen_nic) REFERENCES public.citizens(nic);


--
-- TOC entry 3089 (class 2606 OID 1481487)
-- Name: users FK_be39c6524997cae9cfca8f28a57; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_be39c6524997cae9cfca8f28a57" FOREIGN KEY (service_unit_id) REFERENCES public.service_units(service_unit_id);


--
-- TOC entry 3091 (class 2606 OID 1481497)
-- Name: citizens FK_cfda51a6705133ddb1e00a42adc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citizens
    ADD CONSTRAINT "FK_cfda51a6705133ddb1e00a42adc" FOREIGN KEY (division_id) REFERENCES public.divisions(division_id);


--
-- TOC entry 3081 (class 2606 OID 1481447)
-- Name: mt_availability FK_d14f9550e430c0a401599b207ae; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_availability
    ADD CONSTRAINT "FK_d14f9550e430c0a401599b207ae" FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 3085 (class 2606 OID 1481467)
-- Name: mt_appointments FK_ddbfa89cb3781794d9fc66a5671; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_appointments
    ADD CONSTRAINT "FK_ddbfa89cb3781794d9fc66a5671" FOREIGN KEY (mt_service_id) REFERENCES public.mt_services(mt_service_id);


--
-- TOC entry 3080 (class 2606 OID 1481442)
-- Name: gn_services FK_dde8e2e803faca401e685d35b3b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gn_services
    ADD CONSTRAINT "FK_dde8e2e803faca401e685d35b3b" FOREIGN KEY (service_unit_id) REFERENCES public.service_units(service_unit_id);


--
-- TOC entry 3082 (class 2606 OID 1481452)
-- Name: mt_availability FK_ef69da46389f2c53b2427a38789; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mt_availability
    ADD CONSTRAINT "FK_ef69da46389f2c53b2427a38789" FOREIGN KEY (mt_service_id) REFERENCES public.mt_services(mt_service_id);


-- Completed on 2025-08-16 19:23:21

--
-- PostgreSQL database dump complete
--

