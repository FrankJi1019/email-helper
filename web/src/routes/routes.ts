import { PathNavigator } from "./PathNavigator"

export class Routes {
  public static LOGIN = new PathNavigator("/login")
  public static CONFIRM = new PathNavigator("/confirm")
  public static FORGOT_PASSWORD = new PathNavigator("/forgot-password")
  public static RESET_PASSWORD = new PathNavigator("/reset-password")
  public static SCHEDULE = new PathNavigator("/")
  public static MESSAGES = new PathNavigator("/messages")
}
