import { PathNavigator } from "./PathNavigator"

export class Routes {
  public static LOGIN = new PathNavigator("/login")
  public static SCHEDULE = new PathNavigator("/")
  public static MESSAGES = new PathNavigator("/messages")
}
