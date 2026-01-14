import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';

import {map, Observable} from 'rxjs';

import {toCamelCaseDeep, toSnakeCaseDeep, toSnakeCaseKey} from './case-converter';

function isTransformableBody(body: unknown): boolean {
  // Konwertujemy tylko struktury JSON-owe (plain object / array).
  // Celowo pomijamy: string, Blob, ArrayBuffer, FormData itp.
  return typeof body === 'object' && body !== null;
}

function shouldTransformBody(req: HttpRequest<unknown>): boolean {
  // W praktyce Angular często nie ustawia Content-Type/Accept na GET,
  // a requesty i tak operują na JSON. Dlatego bazujemy na typie body.
  return isTransformableBody(req.body);
}

function shouldTransformResponseBody(event: HttpEvent<unknown>): event is HttpResponse<unknown> {
  if (!(event instanceof HttpResponse)) return false;

  const contentType = (event.headers.get('Content-Type') ?? '').toLowerCase();
  const looksLikeJson =
    contentType.includes('application/json') || contentType.includes('+json');

  const bodyIsObjOrArr = isTransformableBody(event.body);

  // Jeśli backend nie wysyła Content-Type, ale body jest obiektem (typowe dla HttpClient),
  // nadal chcemy konwertować.
  return bodyIsObjOrArr && (looksLikeJson || contentType === '');
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
      ? req.clone({params: transformedParams, body: transformedBody})
      : req;

  return next(transformedReq).pipe(
    map((event) => {
      if (!shouldTransformResponseBody(event)) return event;

      return event.clone({body: toCamelCaseDeep(event.body)});
    }),
  );
};
