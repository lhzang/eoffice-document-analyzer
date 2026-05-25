import {
  delay,
  HttpResponse,
  type DefaultBodyType,
  type HttpResponseResolver,
  type PathParams
} from 'msw'

// A higher-order response resolver that validates
// the request authorization header before proceeding
// with the actual response resolver.
export function withAuth<
  Params extends PathParams,
  RequestBodyType extends DefaultBodyType,
  ResponseBodyType extends DefaultBodyType
>(
  resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>
): HttpResponseResolver<Params, RequestBodyType, ResponseBodyType> {
  return (input) => {
    const { request } = input
    if (!request.headers.get('Authorization')) {
      return new HttpResponse(null, { status: 401 })
    }

    return resolver(input)
  }
}
export async function withDelay<
  Params extends PathParams,
  RequestBodyType extends DefaultBodyType,
  ResponseBodyType extends DefaultBodyType
>(
  resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>
): Promise<HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>> {
  return async (input) => {
    await delay(1000) // Add a delay of 1000ms (1 second)
    return resolver(input) // Resolve the original resolver after the delay
  }
}

export async function withAuthDelay<
  Params extends PathParams,
  RequestBodyType extends DefaultBodyType,
  ResponseBodyType extends DefaultBodyType
>(
  resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>
): Promise<HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>> {
  return async (input) => {
    const { request } = input
    if (!request.headers.get('Authorization')) {
      return new HttpResponse(null, { status: 401 })
    }
    await delay(1000) // Add a delay of 1000ms (1 second)
    return resolver(input) // Resolve the original resolver after the delay
  }
}
