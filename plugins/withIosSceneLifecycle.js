const { withAppDelegate, withInfoPlist } = require("@expo/config-plugins");

const LEGACY_STARTUP = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif`;

const SCENE_DELEGATE = `@objc(SceneDelegate)
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  private var appDelegate: AppDelegate? {
    UIApplication.shared.delegate as? AppDelegate
  }

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard
      let windowScene = scene as? UIWindowScene,
      let appDelegate,
      let factory = appDelegate.reactNativeFactory
    else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: nil)

    connectionOptions.urlContexts.forEach { open($0, appDelegate: appDelegate) }
    connectionOptions.userActivities.forEach {
      _ = appDelegate.application(
        UIApplication.shared,
        continue: $0,
        restorationHandler: { _ in })
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let appDelegate else { return }
    URLContexts.forEach { open($0, appDelegate: appDelegate) }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    guard let appDelegate else { return }
    _ = appDelegate.application(
      UIApplication.shared,
      continue: userActivity,
      restorationHandler: { _ in })
  }

  func sceneDidBecomeActive(_ scene: UIScene) {
    appDelegate?.applicationDidBecomeActive(UIApplication.shared)
  }

  func sceneWillResignActive(_ scene: UIScene) {
    appDelegate?.applicationWillResignActive(UIApplication.shared)
  }

  func sceneDidEnterBackground(_ scene: UIScene) {
    appDelegate?.applicationDidEnterBackground(UIApplication.shared)
  }

  func sceneWillEnterForeground(_ scene: UIScene) {
    appDelegate?.applicationWillEnterForeground(UIApplication.shared)
  }

  private func open(_ context: UIOpenURLContext, appDelegate: AppDelegate) {
    var options: [UIApplication.OpenURLOptionsKey: Any] = [
      .openInPlace: context.options.openInPlace,
    ]
    if let sourceApplication = context.options.sourceApplication {
      options[.sourceApplication] = sourceApplication
    }
    if let annotation = context.options.annotation {
      options[.annotation] = annotation
    }

    _ = appDelegate.application(
      UIApplication.shared,
      open: context.url,
      options: options)
  }
}

`;

function withIosSceneLifecycle(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };
    return config;
  });

  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== "swift") {
      throw new Error("The iOS scene lifecycle plugin requires a Swift AppDelegate.");
    }

    let contents = config.modResults.contents;
    if (contents.includes("ExpoReactNativeFactoryProvider")) {
      return config;
    }
    if (!contents.includes(LEGACY_STARTUP)) {
      throw new Error("The generated AppDelegate startup block has changed.");
    }

    contents = contents.replace(
      LEGACY_STARTUP,
      "    // React Native starts when UIKit connects the window scene."
    );

    const insertionPoint = "class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {";
    if (!contents.includes(insertionPoint)) {
      throw new Error("The generated AppDelegate insertion point was not found.");
    }

    config.modResults.contents = contents.replace(
      insertionPoint,
      `${SCENE_DELEGATE}${insertionPoint}`
    );
    return config;
  });
}

module.exports = withIosSceneLifecycle;
