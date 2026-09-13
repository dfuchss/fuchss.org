/**
 * Everything derived from the PGP fingerprint.
 *
 * The fingerprint itself is data, so it lives in `src/data/socials.yml` next to
 * the other identity values. What is here is only the derivation: `/pgp-key/`
 * and the home page's contact section both quote the key, and the `.asc`
 * filename is the fingerprint, so computing those in one place is what keeps
 * them from drifting apart.
 */
import { socials } from './data.ts';

export const FINGERPRINT = socials.pgp_fingerprint;

/** Grouped into the conventional 4-character blocks. */
export const fingerprintGrouped = FINGERPRINT.match(/.{1,4}/g)!.join(' ');

/** Long key id — the last 16 hex digits, the form you hand a keyserver. */
export const keyId = `0x${FINGERPRINT.slice(-16)}`;

/** Served from `public/`, so the path doubles as the on-disk location. */
export const ascPath = `/assets/pgp-key/${FINGERPRINT}.asc`;
