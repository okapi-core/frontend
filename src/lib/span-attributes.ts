import { camelCase, snakeCase } from 'lodash';

export const TRACE_ID = 'trace_id';
export const SPAN_ID = 'span_id';
export const SPAN_KIND = 'kind';
// svc
export const SERVICE_NAME = 'service_name';
export const SERVICE_PEER_NAME = 'service_peer_name';
// http
export const HTTP_METHOD = 'http_method';
export const HTTP_STATUS_CODE = 'http_status_code';
export const HTTP_REQUEST_SIZE = 'http_request_size';
export const HTTP_RESPONSE_SIZE = 'http_response_size';
export const HTTP_ORIGIN = 'http_origin';
export const HTTP_HOST = 'http_host';
export const SERVER_ADDRESS = 'server_address';
export const SERVER_PORT = 'server_port';
export const CLIENT_ADDRESS = 'client_address';
export const CLIENT_PORT = 'client_port';
export const SOURCE_ADDRESS = 'source_address';
export const SOURCE_PORT = 'source_port';
// network
export const NETWORK_PROTOCOL_TYPE = 'network_protocol_type';
export const NETWORK_PROTOCOL_VERSION = 'network_protocol_version';
// db
export const DB_SYSTEM_NAME = 'db_system_name';
export const DB_COLLECTION_NAME = 'db_collection_name';
export const DB_NAMESPACE = 'db_namespace';
export const DB_OPERATION_NAME = 'db_operation_name';
export const DB_RESPONSE_STATUS_CODE = 'db_response_status_code';
export const DB_QUERY_TEXT = 'db_query_text';
export const DB_QUERY_SUMMARY = 'db_query_summary';
export const DB_STORED_PROCEDURE_NAME = 'db_stored_procedure_name';
export const DB_RESPONSE_RETURNED_ROWS = 'db_response_returned_rows';

// rpc
export const RPC_METHOD = 'rpc_method';
export const RPC_METHOD_ORIGINAL = 'rpc_method_original';
export const RPC_RESPONSE_STATUS_CODE = 'rpc_response_status_code';

const DEFAULT_SPAN_ATTRIBUTES = [
  TRACE_ID,
  SPAN_ID,
  SPAN_KIND,
  SERVICE_NAME,
  SERVICE_PEER_NAME,
  HTTP_METHOD,
  HTTP_STATUS_CODE,
  HTTP_REQUEST_SIZE,
  HTTP_RESPONSE_SIZE,
  HTTP_ORIGIN,
  HTTP_HOST,
  SERVER_ADDRESS,
  SERVER_PORT,
  CLIENT_ADDRESS,
  CLIENT_PORT,
  SOURCE_ADDRESS,
  SOURCE_PORT,
  NETWORK_PROTOCOL_TYPE,
  NETWORK_PROTOCOL_VERSION,
  DB_SYSTEM_NAME,
  DB_COLLECTION_NAME,
  DB_NAMESPACE,
  DB_OPERATION_NAME,
  DB_RESPONSE_STATUS_CODE,
  DB_QUERY_TEXT,
  DB_QUERY_SUMMARY,
  DB_STORED_PROCEDURE_NAME,
  DB_RESPONSE_RETURNED_ROWS,
  RPC_METHOD,
  RPC_METHOD_ORIGINAL,
  RPC_RESPONSE_STATUS_CODE,
];

export const DEFAULT_ATTRIBS_CAMEL_CASE = new Set(
  DEFAULT_SPAN_ATTRIBUTES.map(camelCase),
);

export const DEFAULT_ATTRIBS_CAMEL_CASES = new Map(
  DEFAULT_SPAN_ATTRIBUTES.map((v) => [v, camelCase(v)]),
);

export function isDefaultSpanAttribute(attr: string): boolean {
  return DEFAULT_ATTRIBS_CAMEL_CASE.has(attr);
}

export function getSpanAttributeLabel(attr: string): string {
  const normalized = attr.includes('_') ? attr : snakeCase(attr);
  switch (normalized) {
    case TRACE_ID:
      return 'trace id';
    case SPAN_ID:
      return 'span id';
    case SPAN_KIND:
      return 'span kind';
    case SERVICE_NAME:
      return 'service';
    case SERVICE_PEER_NAME:
      return 'peer service';
    case HTTP_METHOD:
      return 'Http method';
    case HTTP_STATUS_CODE:
      return 'Http status';
    case HTTP_REQUEST_SIZE:
      return 'Http bytes sent';
    case HTTP_RESPONSE_SIZE:
      return 'Http byts received';
    case HTTP_ORIGIN:
      return 'origin';
    case HTTP_HOST:
      return 'host';
    case DB_SYSTEM_NAME:
      return 'db system';
    case DB_COLLECTION_NAME:
      return 'collection';
    case DB_OPERATION_NAME:
      return 'operation';
    case DB_RESPONSE_STATUS_CODE:
      return 'db status';
    case DB_QUERY_SUMMARY:
      return 'query summary';
    case DB_QUERY_TEXT:
      return 'query text';
    case DB_RESPONSE_RETURNED_ROWS:
      return 'returned rows';
    case RPC_METHOD:
      return 'rpc method';
    case RPC_METHOD_ORIGINAL:
      return 'rpc method original';
    case RPC_RESPONSE_STATUS_CODE:
      return 'rpc status';
    default:
      return normalized.replace(/_/g, ' ');
  }
}
