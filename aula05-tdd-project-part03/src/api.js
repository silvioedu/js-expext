const http = require('http')
const CarService = require('./service/carService')

const DEFAULT_PORT = 3000
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
}

const defaultFactory = () => ({
  carService: new CarService({ cars: './../database/cars.json' })
})


class Api {
  constructor(dependencies = defaultFactory()) {
    this.carService = dependencies.carService
  }

  generateRoutes() {

    return {
      '/rent:post': async (request, response) => {
        for await (const data of request) {
          try {
            const { customer, carCategory, numberOfDays } = JSON.parse(data)
            // alguma validacao top aqui
            const result = await this.carService.rent(customer, carCategory, numberOfDays)

            this.success(request, response, result)

          } catch (error) {
            this.error(request, response, error)
          }
        }
      },
      '/calculateFinalPrice:post': async (request, response) => {
        for await (const data of request) {
          try {
            const { customer, carCategory, numberOfDays } = JSON.parse(data)
            // alguma validacao top aqui
            const result = await this.carService.calculateFinalPrice(customer, carCategory, numberOfDays)

            this.success(request, response, result)

          } catch (error) {
            this.error(request, response, error)
          }
        }
      },
      '/getAvailableCar:post': async (request, response) => {
        for await (const data of request) {
          try {
            const carCategory = JSON.parse(data)
            // alguma validacao top aqui

            const result = await this.carService.getAvailableCar(carCategory)

            this.success(request, response, result)

          } catch (error) {
            this.error(request, response, error)
          }
        }
      },
      default: (request, response) => {
        response.write(JSON.stringify({ success: 'Hello World!' }))
        return response.end();
      }
    }
  }


  handler(request, response) {
    const { url, method } = request
    const routeKey = `${url}:${method.toLowerCase()}`

    const routes = this.generateRoutes()
    const chosen = routes[routeKey] || routes.default

    response.writeHead(200, DEFAULT_HEADERS)

    return chosen(request, response)
  }

  success(request, response, result) {
    response.writeHead(200, DEFAULT_HEADERS)
    response.write(JSON.stringify({ result }))
    response.end()
  }

  error(request, response, message) {
    console.error('error', message)
    response.writeHead(500, DEFAULT_HEADERS)
    response.write(JSON.stringify({ error: 'Deu Ruim!' }))
    response.end()
  }

  // criei uma funcao, que recebe as dependencias ou usa a factoryDefault
  initialize(port = DEFAULT_PORT) {

    const app = http.createServer(this.handler.bind(this))
      .listen(port, _ => console.log('app running at', port))

    return app
  }

}

// adiciono NODE_ENV para teste (adicionado no Package.json)
if (process.env.NODE_ENV !== 'test') {
  const api = new Api()
  api.initialize()
}

module.exports = (dependencies) => new Api(dependencies)