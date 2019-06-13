class Settings {
  constructor() {
    let app_dir = `${process.cwd()}/dist/`;
    let shots_dir = `${app_dir}output/captures/`;

    this.app_dir = `${app_dir}`;
    this.shots_dir = `${shots_dir}`;
    this.capture_dir = `${shots_dir}new/`;
    this.reference_dir = `${shots_dir}reference/`;
    this.output_dir = `${app_dir}output/results/`;
    this.baseline_mode = false;
    this.default_config = `./app/configs/default`;
    this.headless = true
  }
}

exports.NewSettings = () => {
  return new Settings();
}