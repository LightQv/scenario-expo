import ExpoModulesCore
import UIKit

public class ScenarioNavigationAppearanceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ScenarioNavigationAppearance")

    Function("setTransparent") {
      DispatchQueue.main.async {
        NavigationAppearanceController.shared.setTransparent()
      }
    }

    Function("disableScrollEdgeEffectsForView") { (reactTag: Int) in
      DispatchQueue.main.async {
        NavigationAppearanceController.shared.disableScrollEdgeEffects(forReactTag: reactTag)
      }
    }

    Function("restore") {
      DispatchQueue.main.async {
        NavigationAppearanceController.shared.restore()
      }
    }
  }
}

private struct NavigationBarSnapshot {
  let standardAppearance: UINavigationBarAppearance
  let scrollEdgeAppearance: UINavigationBarAppearance?
  let compactAppearance: UINavigationBarAppearance?
  let compactScrollEdgeAppearance: UINavigationBarAppearance?
  let isTranslucent: Bool
}

private final class NavigationAppearanceController {
  static let shared = NavigationAppearanceController()

  private var snapshot: NavigationBarSnapshot?
  private weak var snapshotNavigationBar: UINavigationBar?
  private var appearanceToken = 0

  func setTransparent() {
    appearanceToken += 1
    let token = appearanceToken
    setTransparentIfCurrent(token: token)

    DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self] in
      self?.setTransparentIfCurrent(token: token)
    }
  }

  func restore() {
    appearanceToken += 1

    guard let snapshot, let navigationBar = snapshotNavigationBar else {
      self.snapshot = nil
      snapshotNavigationBar = nil
      return
    }

    navigationBar.standardAppearance = snapshot.standardAppearance
    navigationBar.scrollEdgeAppearance = snapshot.scrollEdgeAppearance
    navigationBar.compactAppearance = snapshot.compactAppearance
    navigationBar.compactScrollEdgeAppearance = snapshot.compactScrollEdgeAppearance
    navigationBar.isTranslucent = snapshot.isTranslucent

    self.snapshot = nil
    snapshotNavigationBar = nil
  }

  func disableScrollEdgeEffects(forReactTag reactTag: Int) {
    let delays: [TimeInterval] = [0, 0.05, 0.2, 0.5]

    for delay in delays {
      DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
        self?.disableScrollEdgeEffectsIfFound(reactTag: reactTag)
      }
    }
  }

  private func setTransparentIfCurrent(token: Int) {
    guard token == appearanceToken else { return }
    guard let navigationBar = activeNavigationController()?.navigationBar else { return }

    if snapshot == nil || snapshotNavigationBar !== navigationBar {
      snapshot = NavigationBarSnapshot(
        standardAppearance: navigationBar.standardAppearance.copy() as! UINavigationBarAppearance,
        scrollEdgeAppearance: navigationBar.scrollEdgeAppearance?.copy() as? UINavigationBarAppearance,
        compactAppearance: navigationBar.compactAppearance?.copy() as? UINavigationBarAppearance,
        compactScrollEdgeAppearance: navigationBar.compactScrollEdgeAppearance?.copy() as? UINavigationBarAppearance,
        isTranslucent: navigationBar.isTranslucent
      )
      snapshotNavigationBar = navigationBar
    }

    applyTransparentAppearance(to: navigationBar)
  }

  private func applyTransparentAppearance(to navigationBar: UINavigationBar) {
    let transparentAppearance = UINavigationBarAppearance()
    transparentAppearance.configureWithTransparentBackground()
    transparentAppearance.backgroundColor = .clear
    transparentAppearance.backgroundEffect = nil
    transparentAppearance.shadowColor = .clear

    navigationBar.isTranslucent = true
    navigationBar.standardAppearance = transparentAppearance
    navigationBar.scrollEdgeAppearance = transparentAppearance
    navigationBar.compactAppearance = transparentAppearance
    navigationBar.compactScrollEdgeAppearance = transparentAppearance
  }

  private func disableScrollEdgeEffectsIfFound(reactTag: Int) {
    guard let rootView = activeWindow()?.rootViewController?.view else { return }
    guard let targetView = findView(withReactTag: reactTag, in: rootView) else { return }

    let scrollViews = findScrollViews(in: targetView)

    if let targetScrollView = targetView as? UIScrollView {
      applyParallaxScrollViewAppearance(to: targetScrollView)
    }

    for scrollView in scrollViews {
      applyParallaxScrollViewAppearance(to: scrollView)
    }
  }

  private func applyParallaxScrollViewAppearance(to scrollView: UIScrollView) {
    scrollView.contentInsetAdjustmentBehavior = .never
    scrollView.automaticallyAdjustsScrollIndicatorInsets = false
    scrollView.backgroundColor = .clear

    if #available(iOS 26.0, *) {
      scrollView.topEdgeEffect.isHidden = true
      scrollView.bottomEdgeEffect.isHidden = true
      scrollView.leftEdgeEffect.isHidden = true
      scrollView.rightEdgeEffect.isHidden = true
    }
  }

  private func findScrollViews(in view: UIView) -> [UIScrollView] {
    var scrollViews: [UIScrollView] = []

    if let scrollView = view as? UIScrollView {
      scrollViews.append(scrollView)
    }

    for subview in view.subviews {
      scrollViews.append(contentsOf: findScrollViews(in: subview))
    }

    return scrollViews
  }

  private func findView(withReactTag reactTag: Int, in view: UIView) -> UIView? {
    if view.tag == reactTag {
      return view
    }

    for subview in view.subviews {
      if let matchingView = findView(withReactTag: reactTag, in: subview) {
        return matchingView
      }
    }

    return nil
  }

  private func activeNavigationController() -> UINavigationController? {
    guard let rootViewController = activeWindow()?.rootViewController else { return nil }
    return findNavigationController(from: rootViewController)
  }

  private func findNavigationController(from viewController: UIViewController) -> UINavigationController? {
    if let navigationController = viewController as? UINavigationController {
      return findNavigationController(from: navigationController.visibleViewController ?? navigationController.topViewController ?? viewController) ?? navigationController
    }

    if let tabBarController = viewController as? UITabBarController,
       let selectedViewController = tabBarController.selectedViewController {
      return findNavigationController(from: selectedViewController)
    }

    if let presentedViewController = viewController.presentedViewController {
      return findNavigationController(from: presentedViewController)
    }

    for childViewController in viewController.children.reversed() {
      if let navigationController = findNavigationController(from: childViewController) {
        return navigationController
      }
    }

    return viewController.navigationController
  }

  private func activeWindow() -> UIWindow? {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .filter { $0.activationState == .foregroundActive }
      .flatMap { $0.windows }
      .last { !$0.isHidden && $0.windowLevel == .normal }
  }
}
