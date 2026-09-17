import {
  DB_OPERATION_NAME,
  DB_SYSTEM_NAME,
  HTTP_METHOD,
  HTTP_STATUS_CODE,
  SERVICE_NAME,
  SPAN_ID,
  TRACE_ID,
} from './span-attributes';
import { camelCase } from 'lodash';

export type AttributeContext = 'logs' | 'spans';
export type AttributeLayout =
  | 'body'
  | 'dbOperation'
  | 'dbSystem'
  | 'duration'
  | 'generic'
  | 'httpMethod'
  | 'httpStatusCode'
  | 'identifier'
  | 'service'
  | 'severity'
  | 'timestamp';

export class AttributeClassifier {
  static classify({
    name,
    context,
  }: {
    name: string;
    context: AttributeContext;
  }): AttributeLayout {
    if (context === 'logs') {
      if (name === 'tsNanos') return 'timestamp';
      if (name === 'logLevel' || name === 'severityText') return 'severity';
      if (name === 'body') return 'body';
    }

    if (context === 'spans' && name === 'durationMillis') {
      return 'duration';
    }
    if (context === 'spans' && name === camelCase(DB_SYSTEM_NAME)) {
      return 'dbSystem';
    }
    if (context === 'spans' && name === camelCase(DB_OPERATION_NAME)) {
      return 'dbOperation';
    }
    if (name === camelCase(HTTP_METHOD)) return 'httpMethod';
    if (name === camelCase(HTTP_STATUS_CODE)) return 'httpStatusCode';
    if (name === camelCase(TRACE_ID) || name === camelCase(SPAN_ID)) {
      return 'identifier';
    }
    if (name === camelCase(SERVICE_NAME)) return 'service';
    return 'generic';
  }
}
