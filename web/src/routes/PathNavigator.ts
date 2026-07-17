import { generatePath } from "react-router-dom"

export class PathNavigator {
  public readonly path: string

  constructor(path: string) {
    this.path = path
  }

  public generate(pathParams: { [key: string]: string }): string {
    return generatePath(this.path, pathParams)
  }
}
