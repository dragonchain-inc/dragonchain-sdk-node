import * as del from 'node-delete'

del('lib/types/**/*.js', (error: Error) => {
  if (error) {
    console.log(error)
  }
})
