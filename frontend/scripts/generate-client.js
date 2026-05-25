import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '..')
const ABS_OUTPUT_DIR = path.join(ROOT_DIR, 'src', 'shared', 'services', 'api')
const ABS_INPUT_FILE = path.join(ABS_OUTPUT_DIR, 'api-docs.yaml')

const relativeInputFile = path.relative(process.cwd(), ABS_INPUT_FILE).replaceAll('\\', '/')
const relativeOutputDir = path.relative(process.cwd(), ABS_OUTPUT_DIR).replaceAll('\\', '/')

const ALLOWED_EXTENSIONS = new Set(['.ts', '.yaml'])

// 2. Chạy lệnh sinh mã
console.log('--- Generate Typescript Axios client ... ---')
console.log(`Input: ${relativeInputFile}`)
console.log(`Output: ${relativeOutputDir}`)

try {
  const command = `openapi-generator-cli generate -i "${relativeInputFile}" -g typescript-axios -o "${relativeOutputDir}" --skip-validate-spec`

  execSync(command, { stdio: 'inherit' })
} catch (error) {
  console.error('An error occurred when generating client:', error.message)
  process.exit(1)
}

// 3. Hàm dọn dẹp file thừa
function cleanup(directory) {
  if (!fs.existsSync(directory)) return

  const files = fs.readdirSync(directory)

  files.forEach((file) => {
    const fullPath = path.join(directory, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      console.log(`Removing unnecessary folder: ${file}`)
      fs.rmSync(fullPath, { recursive: true, force: true })
    } else {
      const ext = path.extname(file)
      // Sử dụng .has() cho Set
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        console.log(`Removing unnecessary file: ${file}`)
        fs.unlinkSync(fullPath)
      }
    }
  })
}

console.log('--- Cleaning up ... ---')
cleanup(ABS_OUTPUT_DIR)
console.log('--- Generated client successfully! ---')
