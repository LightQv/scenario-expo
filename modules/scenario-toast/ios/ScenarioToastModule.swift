import ExpoModulesCore
import UIKit

public class ScenarioToastModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ScenarioToast")

    Function("show") { (message: String, type: String) in
      DispatchQueue.main.async {
        ScenarioToastPresenter.shared.show(message: message, type: type)
      }
    }
  }
}

private final class ScenarioToastPresenter {
  static let shared = ScenarioToastPresenter()

  private var overlayView: UIView?
  private var shadowView: UIView?
  private var iconContainer: UIView?
  private var imageView: UIImageView?
  private var activityIndicator: UIActivityIndicatorView?
  private var label: UILabel?
  private var dismissWorkItem: DispatchWorkItem?

  private let toastHeight: CGFloat = 52
  private let toastDuration: TimeInterval = 2.4

  func show(message: String, type: String) {
    dismissWorkItem?.cancel()

    if overlayView != nil {
      update(message: message, type: type, animated: true)
      scheduleDismissIfNeeded(type: type)
      return
    }

    guard let window = activeWindow() else { return }

    let overlay = UIView(frame: window.bounds)
    overlay.backgroundColor = .clear
    overlay.isUserInteractionEnabled = false
    overlay.autoresizingMask = [.flexibleWidth, .flexibleHeight]

    let shadowView = UIView()
    shadowView.translatesAutoresizingMaskIntoConstraints = false
    shadowView.backgroundColor = .clear
    shadowView.layer.shadowColor = UIColor.black.cgColor
    shadowView.layer.shadowOpacity = 0.18
    shadowView.layer.shadowRadius = 22
    shadowView.layer.shadowOffset = CGSize(width: 0, height: 10)
    shadowView.layer.masksToBounds = false

    let blurView = UIVisualEffectView(effect: UIBlurEffect(style: .systemMaterial))
    blurView.translatesAutoresizingMaskIntoConstraints = false
    blurView.clipsToBounds = true
    blurView.layer.cornerRadius = 21
    blurView.layer.cornerCurve = .continuous
    blurView.layer.borderWidth = 1 / UIScreen.main.scale
    blurView.layer.borderColor = UIColor.separator.cgColor

    let iconContainer = UIView()
    iconContainer.translatesAutoresizingMaskIntoConstraints = false
    iconContainer.backgroundColor = color(for: type)
    iconContainer.layer.cornerRadius = 11.5
    iconContainer.layer.cornerCurve = .continuous

    let symbolName = type == "success" ? "checkmark" : "exclamationmark"
    let symbolConfig = UIImage.SymbolConfiguration(pointSize: 12, weight: .bold)
    let imageView = UIImageView(image: UIImage(systemName: symbolName, withConfiguration: symbolConfig))
    imageView.translatesAutoresizingMaskIntoConstraints = false
    imageView.tintColor = .white
    imageView.contentMode = .scaleAspectFit

    let activityIndicator = UIActivityIndicatorView(style: .medium)
    activityIndicator.translatesAutoresizingMaskIntoConstraints = false
    activityIndicator.color = .white
    activityIndicator.hidesWhenStopped = true

    let label = UILabel()
    label.translatesAutoresizingMaskIntoConstraints = false
    label.text = message
    label.textColor = .label
    label.font = UIFont(name: "FiraSans-Medium", size: 14) ?? .systemFont(ofSize: 14, weight: .medium)
    label.numberOfLines = 2
    label.lineBreakMode = .byTruncatingTail

    iconContainer.addSubview(imageView)
    iconContainer.addSubview(activityIndicator)
    blurView.contentView.addSubview(iconContainer)
    blurView.contentView.addSubview(label)
    shadowView.addSubview(blurView)
    overlay.addSubview(shadowView)
    window.addSubview(overlay)

    let centerYOffset = window.bounds.height * 0.75 - window.bounds.midY

    NSLayoutConstraint.activate([
      shadowView.centerXAnchor.constraint(equalTo: overlay.centerXAnchor),
      shadowView.centerYAnchor.constraint(equalTo: overlay.centerYAnchor, constant: centerYOffset),
      shadowView.leadingAnchor.constraint(greaterThanOrEqualTo: overlay.leadingAnchor, constant: 16),
      shadowView.trailingAnchor.constraint(lessThanOrEqualTo: overlay.trailingAnchor, constant: -16),

      blurView.leadingAnchor.constraint(equalTo: shadowView.leadingAnchor),
      blurView.trailingAnchor.constraint(equalTo: shadowView.trailingAnchor),
      blurView.topAnchor.constraint(equalTo: shadowView.topAnchor),
      blurView.bottomAnchor.constraint(equalTo: shadowView.bottomAnchor),
      blurView.heightAnchor.constraint(greaterThanOrEqualToConstant: toastHeight),
      blurView.widthAnchor.constraint(lessThanOrEqualToConstant: 430),

      iconContainer.leadingAnchor.constraint(equalTo: blurView.contentView.leadingAnchor, constant: 14),
      iconContainer.centerYAnchor.constraint(equalTo: blurView.contentView.centerYAnchor),
      iconContainer.widthAnchor.constraint(equalToConstant: 23),
      iconContainer.heightAnchor.constraint(equalToConstant: 23),

      imageView.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
      imageView.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),

      activityIndicator.centerXAnchor.constraint(equalTo: iconContainer.centerXAnchor),
      activityIndicator.centerYAnchor.constraint(equalTo: iconContainer.centerYAnchor),

      label.leadingAnchor.constraint(equalTo: iconContainer.trailingAnchor, constant: 9),
      label.trailingAnchor.constraint(equalTo: blurView.contentView.trailingAnchor, constant: -14),
      label.topAnchor.constraint(greaterThanOrEqualTo: blurView.contentView.topAnchor, constant: 10),
      label.bottomAnchor.constraint(lessThanOrEqualTo: blurView.contentView.bottomAnchor, constant: -10),
      label.centerYAnchor.constraint(equalTo: blurView.contentView.centerYAnchor)
    ])

    overlay.layoutIfNeeded()
    overlay.alpha = 0
    shadowView.transform = CGAffineTransform(translationX: 0, y: 10).scaledBy(x: 0.98, y: 0.98)

    UIView.animate(
      withDuration: 0.34,
      delay: 0,
      usingSpringWithDamping: 0.82,
      initialSpringVelocity: 0.25,
      options: [.beginFromCurrentState, .allowUserInteraction]
    ) {
      overlay.alpha = 1
      shadowView.transform = .identity
    }

    overlayView = overlay
    self.shadowView = shadowView
    self.iconContainer = iconContainer
    self.imageView = imageView
    self.activityIndicator = activityIndicator
    self.label = label

    update(message: message, type: type, animated: false)
    scheduleDismissIfNeeded(type: type)
  }

  private func update(message: String, type: String, animated: Bool) {
    label?.text = message
    iconContainer?.backgroundColor = color(for: type)

    if type == "pending" {
      imageView?.isHidden = true
      activityIndicator?.isHidden = false
      activityIndicator?.startAnimating()
      return
    }

    activityIndicator?.stopAnimating()
    activityIndicator?.isHidden = true
    imageView?.isHidden = false

    let symbolName = type == "success" ? "checkmark" : "exclamationmark"
    let symbolConfig = UIImage.SymbolConfiguration(pointSize: 12, weight: .bold)
    imageView?.image = UIImage(systemName: symbolName, withConfiguration: symbolConfig)

    guard animated, let shadowView else { return }

    shadowView.transform = CGAffineTransform(scaleX: 0.98, y: 0.98)
    UIView.animate(
      withDuration: 0.22,
      delay: 0,
      usingSpringWithDamping: 0.78,
      initialSpringVelocity: 0.2,
      options: [.beginFromCurrentState, .allowUserInteraction]
    ) {
      shadowView.transform = .identity
    }
  }

  private func scheduleDismissIfNeeded(type: String) {
    dismissWorkItem?.cancel()

    guard type != "pending", let overlay = overlayView, let shadowView = shadowView else {
      dismissWorkItem = nil
      return
    }

    let workItem = DispatchWorkItem { [weak self, weak overlay, weak shadowView] in
      UIView.animate(
        withDuration: 0.18,
        delay: 0,
        options: [.beginFromCurrentState, .allowUserInteraction]
      ) {
        overlay?.alpha = 0
        shadowView?.transform = CGAffineTransform(translationX: 0, y: -8).scaledBy(x: 0.98, y: 0.98)
      } completion: { _ in
        overlay?.removeFromSuperview()
        if self?.overlayView === overlay {
          self?.overlayView = nil
          self?.shadowView = nil
          self?.iconContainer = nil
          self?.imageView = nil
          self?.activityIndicator = nil
          self?.label = nil
          self?.dismissWorkItem = nil
        }
      }
    }

    dismissWorkItem = workItem
    DispatchQueue.main.asyncAfter(deadline: .now() + toastDuration, execute: workItem)
  }

  private func activeWindow() -> UIWindow? {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .filter { $0.activationState == .foregroundActive }
      .flatMap { $0.windows }
      .last { !$0.isHidden && $0.windowLevel == .normal }
  }

  private func color(for type: String) -> UIColor {
    if type == "success" {
      return UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
          ? UIColor(red: 0.51, green: 0.76, blue: 0.47, alpha: 1)
          : UIColor(red: 0.33, green: 0.61, blue: 0.28, alpha: 1)
      }
    }

    if type == "pending" {
      return UIColor { traitCollection in
        traitCollection.userInterfaceStyle == .dark
          ? UIColor(red: 0.47, green: 0.47, blue: 0.51, alpha: 1)
          : UIColor(red: 0.38, green: 0.38, blue: 0.41, alpha: 1)
      }
    }

    return UIColor { traitCollection in
      traitCollection.userInterfaceStyle == .dark
        ? UIColor(red: 0.96, green: 0.49, blue: 0.49, alpha: 1)
        : UIColor(red: 0.94, green: 0.27, blue: 0.27, alpha: 1)
    }
  }
}
