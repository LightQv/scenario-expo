import ExpoModulesCore

public class ScenarioContextMenuModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ScenarioContextMenu")

    View(ScenarioContextMenuView.self) {
      Events("onAction")

      Prop("actions") { (view, actions: [ScenarioContextMenuAction]) in
        view.actions = actions
      }

      Prop("preview") { (view, preview: ScenarioContextMenuPreview) in
        view.preview = preview
      }
    }
  }
}

struct ScenarioContextMenuAction: Record {
  @Field
  var id: String = ""

  @Field
  var label: String = ""

  @Field
  var systemImage: String?

  @Field
  var destructive: Bool = false
}

struct ScenarioContextMenuPreview: Record {
  @Field
  var title: String = ""

  @Field
  var subtitle: String = ""

  @Field
  var posterPath: String?

  @Field
  var viewed: Bool = false

  @Field
  var badgeLabel: String?
}
