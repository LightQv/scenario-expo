import ExpoModulesCore
import UIKit

final class ScenarioContextMenuView: ExpoView, UIContextMenuInteractionDelegate {
  let onAction = EventDispatcher()

  var actions: [ScenarioContextMenuAction] = []
  var preview = ScenarioContextMenuPreview()

  private lazy var contextMenuInteraction = UIContextMenuInteraction(delegate: self)

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    isUserInteractionEnabled = true
    addInteraction(contextMenuInteraction)
  }

  override func layoutSubviews() {
    super.layoutSubviews()

    for subview in subviews {
      subview.frame = bounds
    }
  }

  func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    configurationForMenuAtLocation location: CGPoint
  ) -> UIContextMenuConfiguration? {
    UIContextMenuConfiguration(
      identifier: nil,
      previewProvider: { [weak self] in
        guard let self else { return nil }
        return ScenarioContextMenuPreviewController(preview: self.preview)
      },
      actionProvider: { [weak self] _ in
        guard let self else { return UIMenu(children: []) }

        let menuActions = self.actions.map { action in
          UIAction(
            title: action.label,
            image: action.systemImage.flatMap { UIImage(systemName: $0) },
            attributes: action.destructive ? [.destructive] : []
          ) { [weak self] _ in
            self?.onAction(["actionId": action.id])
          }
        }

        return UIMenu(children: menuActions)
      }
    )
  }

  func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    previewForHighlightingMenuWithConfiguration configuration: UIContextMenuConfiguration
  ) -> UITargetedPreview? {
    let parameters = UIPreviewParameters()
    parameters.backgroundColor = .clear
    parameters.visiblePath = UIBezierPath(
      roundedRect: bounds,
      cornerRadius: 12
    )
    return UITargetedPreview(view: self, parameters: parameters)
  }
}

private final class ScenarioContextMenuPreviewController: UIViewController {
  private let preview: ScenarioContextMenuPreview
  private let posterImageView = UIImageView()
  private var imageTask: URLSessionDataTask?

  init(preview: ScenarioContextMenuPreview) {
    self.preview = preview
    super.init(nibName: nil, bundle: nil)
    preferredContentSize = CGSize(width: UIScreen.main.bounds.width - 32, height: 129)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    buildView()
    loadPoster()
  }

  deinit {
    imageTask?.cancel()
  }

  private func buildView() {
    view.backgroundColor = .systemBackground
    view.layer.cornerRadius = 30
    view.layer.cornerCurve = .continuous
    view.clipsToBounds = true

    let card = UIView()
    card.translatesAutoresizingMaskIntoConstraints = false
    card.backgroundColor = .systemBackground
    card.layer.cornerRadius = 30
    card.layer.cornerCurve = .continuous
    card.clipsToBounds = true
    view.addSubview(card)

    posterImageView.translatesAutoresizingMaskIntoConstraints = false
    posterImageView.contentMode = .scaleAspectFill
    posterImageView.clipsToBounds = true
    posterImageView.backgroundColor = .systemGray5
    posterImageView.layer.cornerRadius = 16
    posterImageView.layer.cornerCurve = .continuous
    posterImageView.layer.borderWidth = 1 / UIScreen.main.scale
    posterImageView.layer.borderColor = UIColor.separator.cgColor
    card.addSubview(posterImageView)

    let titleLabel = UILabel()
    titleLabel.translatesAutoresizingMaskIntoConstraints = false
    titleLabel.text = preview.title
    titleLabel.textColor = .label
    titleLabel.font = UIFont(name: "FiraSans-Bold", size: 16) ?? .systemFont(ofSize: 16, weight: .bold)
    titleLabel.numberOfLines = 2
    titleLabel.lineBreakMode = .byTruncatingTail

    let subtitleLabel = UILabel()
    subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
    subtitleLabel.text = preview.subtitle
    subtitleLabel.textColor = .secondaryLabel
    subtitleLabel.font = UIFont(name: "FiraSans-Regular", size: 13) ?? .systemFont(ofSize: 13)
    subtitleLabel.numberOfLines = 1
    subtitleLabel.lineBreakMode = .byTruncatingTail

    let textStack = UIStackView(arrangedSubviews: [titleLabel, subtitleLabel])
    textStack.translatesAutoresizingMaskIntoConstraints = false
    textStack.axis = .vertical
    textStack.alignment = .fill
    textStack.spacing = 4
    card.addSubview(textStack)

    if let badgeLabel = preview.badgeLabel, !badgeLabel.isEmpty {
      let badge = makeBadge(label: badgeLabel)
      card.addSubview(badge)

      NSLayoutConstraint.activate([
        textStack.trailingAnchor.constraint(lessThanOrEqualTo: badge.leadingAnchor, constant: -10),
        badge.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -14),
        badge.centerYAnchor.constraint(equalTo: card.centerYAnchor),
      ])
    } else {
      NSLayoutConstraint.activate([
        textStack.trailingAnchor.constraint(lessThanOrEqualTo: card.trailingAnchor, constant: -14),
      ])
    }

    if preview.viewed {
      let eyeView = UIImageView(image: UIImage(systemName: "eye"))
      eyeView.translatesAutoresizingMaskIntoConstraints = false
      eyeView.tintColor = .label
      eyeView.contentMode = .scaleAspectFit
      card.addSubview(eyeView)

      NSLayoutConstraint.activate([
        eyeView.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 4),
        eyeView.centerYAnchor.constraint(equalTo: card.centerYAnchor),
        eyeView.widthAnchor.constraint(equalToConstant: 11),
        eyeView.heightAnchor.constraint(equalToConstant: 11)
      ])
    }

    NSLayoutConstraint.activate([
      card.topAnchor.constraint(equalTo: view.topAnchor),
      card.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      card.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      card.bottomAnchor.constraint(equalTo: view.bottomAnchor),

      posterImageView.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 14),
      posterImageView.centerYAnchor.constraint(equalTo: card.centerYAnchor),
      posterImageView.widthAnchor.constraint(equalToConstant: 70),
      posterImageView.heightAnchor.constraint(equalToConstant: 105),

      textStack.leadingAnchor.constraint(equalTo: posterImageView.trailingAnchor, constant: 14),
      textStack.centerYAnchor.constraint(equalTo: card.centerYAnchor)
    ])
  }

  private func makeBadge(label: String) -> UILabel {
    let badge = UILabel()
    badge.translatesAutoresizingMaskIntoConstraints = false
    badge.text = label
    badge.textColor = UIColor(red: 234 / 255, green: 178 / 255, blue: 8 / 255, alpha: 1)
    badge.font = .systemFont(ofSize: 11, weight: .bold)
    badge.backgroundColor = UIColor(red: 234 / 255, green: 178 / 255, blue: 8 / 255, alpha: 0.16)
    badge.layer.cornerRadius = 12
    badge.layer.cornerCurve = .continuous
    badge.clipsToBounds = true
    badge.textAlignment = .center
    badge.setContentHuggingPriority(.required, for: .horizontal)
    badge.setContentCompressionResistancePriority(.required, for: .horizontal)

    NSLayoutConstraint.activate([
      badge.heightAnchor.constraint(greaterThanOrEqualToConstant: 25),
      badge.widthAnchor.constraint(greaterThanOrEqualToConstant: 44)
    ])

    return badge
  }

  private func loadPoster() {
    guard let posterPath = preview.posterPath, !posterPath.isEmpty else { return }
    guard let url = URL(string: "https://image.tmdb.org/t/p/w342/\(posterPath)") else { return }

    imageTask = URLSession.shared.dataTask(with: url) { [weak self] data, _, _ in
      guard let data, let image = UIImage(data: data) else { return }

      DispatchQueue.main.async {
        self?.posterImageView.image = image
      }
    }
    imageTask?.resume()
  }
}
