require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ScenarioNavigationAppearance'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.author         = 'Scenario'
  s.homepage       = 'https://scenario.local'
  s.platforms      = { :ios => '16.4' }
  s.source         = { :git => 'https://scenario.local/ScenarioNavigationAppearance.git', :tag => s.version.to_s }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = 'ios/**/*.{h,m,mm,swift}'
end
