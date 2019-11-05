/**
 * This module provides validation of public keys and extended public keys.  Also it provides public key compression.
 * @module keys
 */

import {validateHex} from "./utils";
import {NETWORKS, networkData} from "./networks";

const bip32 = require('bip32');

/**
 * Provide validation messages for an extended public key.
 * @param {string} inputString - base58 encoded extended public key
 * @param {module:networks.NETWORKS} network  - bitcoin network
 * @returns {string} empty if valid or corresponding validation message
 */
export function validateExtendedPublicKey(inputString, network) {
  if (inputString === null || inputString === undefined || inputString === '') {
    return "Extended public key cannot be blank.";
  }

  let requiredPrefix = "'xpub'";
  if (network === NETWORKS.TESTNET) {
    requiredPrefix += " or 'tpub'";
  }
  const notXpubError = `Extended public key must begin with ${requiredPrefix}.`;

  // FIXME: this message is inaccurate
  if (inputString.length < 5) {
    return notXpubError;
  }

  const prefix = inputString.slice(0, 4);
  if (! (prefix === 'xpub' || (network === NETWORKS.TESTNET && prefix === 'tpub'))) {
    return notXpubError;
  }

  try {
    bip32.fromBase58(inputString, networkData(network));
  } catch (e) {
    return `Invalid extended public key: ${e}`;
  }

  return '';

}

/**
 * Provide validation messages for a public key.
 * @param {string} inputString - hex public key string
 * @returns {string} empty if valid or corresponding validation message
 */
export function validatePublicKey(inputString) {
  if (inputString === null || inputString === undefined || inputString === '') {
    return "Public key cannot be blank.";
  }

  const error = validateHex(inputString);
  if (error !== '') { return error; }

  // FIXME -- how do I validate a public key?
  // x
  // try {
  //   bip32.fromPublicKey(new Buffer(inputString), chainCode, network);
  // } catch (e) {
  //   return `Invalid public key ${e}.`;
  // }

  return '';
}

/**
 * Compresses a public key.
 * @param {string} publicKey - the hex public key to compress
 * @returns {string} compressed public key
 */
export function compressPublicKey(publicKey) {
  // validate Public Key Length
  // validate Public Key Structure
  const pubkeyBuffer = Buffer.from(publicKey, 'hex');
  // eslint-disable-next-line no-bitwise
  const prefix = (pubkeyBuffer[64] & 1) !== 0 ? 0x03 : 0x02;
  const prefixBuffer = Buffer.alloc(1);
  prefixBuffer[0] = prefix;
  return Buffer.concat([prefixBuffer, pubkeyBuffer.slice(1, 1 + 32)]).toString('hex');
}
