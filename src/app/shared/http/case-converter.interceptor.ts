import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import { map, Observable } from 'rxjs';

import { toCamelCaseDeep, toSnakeCaseDeep, toSnakeCaseKey } from './case-converter';

function shouldTransformBody(req: HttpRequest<unknown>): boolean {
  // Transformujemy tylko JSON-y. GET zwykle nie ma body.
  const contentType = (req.headers.get('Content-Type') ?? '').toLowerCase();
  const accepts = (req.headers.get('Accept') ?? '').toLowerCase();

  const looksLikeJson =
    contentType.includes('application/json') || accepts.includes('application/json');

  // Jeśli nie mamy żadnych wskazówek w headerach, i tak można trafić na JSON.
  // Dla bezpieczeństwa ograniczamy się do typów obiekt/array.
  const bodyIsObjOrArr = typeof req.body === 'object' && req.body !== null;

  return looksLikeJson && bodyIsObjOrArr;
}

function shouldTransformResponseBody(event: HttpEvent<unknown>): event is HttpResponse<unknown> {
  if (!(event instanceof HttpResponse)) return false;

  const contentType = (event.headers.get('Content-Type') ?? '').toLowerCase();
  const looksLikeJson = contentType.includes('application/json');

  const bodyIsObjOrArr = typeof event.body === 'object' && event.body !== null;

  return looksLikeJson && bodyIsObjOrArr;
}

function toSnakeCaseParams(params: HttpParams): HttpParams {
  // HttpParams jest immutable. Przepisujemy wszystkie klucze.
  let out = new HttpParams();

  for (const key of params.keys()) {
    const snakeKey = toSnakeCaseKey(key);

    const values = params.getAll(key) ?? [];
    for (const val of values) {
      out = out.append(snakeKey, val);
    }
  }

  return out;
}

export const caseConverterInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const hasParams = req.params.keys().length > 0;
  const transformedParams = hasParams ? toSnakeCaseParams(req.params) : req.params;

  const transformedBody = shouldTransformBody(req) ? toSnakeCaseDeep(req.body) : req.body;

  const transformedReq =
    transformedParams !== req.params || transformedBody !== req.body
      ? req.clone({ params: transformedParams, body: transformedBody })
      : req;

  return next(transformedReq).pipe(
    map((event) => {
      if (!shouldTransformResponseBody(event)) return event;

      return event.clone({ body: toCamelCaseDeep(event.body) });
    }),
  );
};
