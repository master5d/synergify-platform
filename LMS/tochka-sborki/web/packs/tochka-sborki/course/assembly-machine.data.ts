export type Point = readonly [number, number]
export type Polygon = readonly Point[]

const box = (x: number, y: number, w: number, h: number): Polygon => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]

// The chassis is one silhouette. Its even-odd cut-outs keep interior regions from being dimmed twice.
export const SHELLS: Record<string, Polygon | string> = {
  ignition: box(420, 180, 230, 250),
  chassis: 'M 70 190 L 250 120 L 780 135 L 1015 285 L 1045 520 L 900 655 L 350 720 L 105 620 Z M 410 205 L 700 190 L 830 305 L 770 420 L 470 415 L 350 315 Z M 475 300 L 590 265 L 635 350 L 475 365 Z M 620 350 L 760 335 L 790 445 L 635 455 Z M 600 390 L 720 390 L 700 520 L 585 515 Z',
  garage: box(600, 475, 390, 300), fuel: box(20, 45, 245, 380), navigator: box(425, 265, 175, 150), glovebox: box(575, 300, 205, 180), wipers: box(250, 165, 430, 190),
  hitch: box(930, 185, 340, 410), convoy: box(925, 5, 350, 245), atlas: box(600, 365, 190, 180), dyno: box(790, 390, 350, 280), computer: box(510, 175, 330, 220),
}

export const PARTS: Record<string, Polygon> = {
  'ignition.fob': box(445, 355, 42, 30), 'ignition.idea-lamp': box(535, 280, 30, 24), 'ignition.door-organizer': box(390, 350, 55, 48), 'ignition.key': box(475, 330, 28, 48), 'ignition.vin-plate': box(625, 220, 38, 28),
  'chassis.gearbox': box(515, 420, 92, 70), 'chassis.trim-plate': box(280, 590, 70, 22), 'chassis.pedal': box(445, 470, 30, 55),
  'garage.obd-scanner': box(650, 520, 110, 85), 'garage.tool-cart': box(625, 610, 135, 150), 'garage.test-cone': box(895, 645, 58, 90),
  'fuel.pump': box(55, 80, 145, 245), 'fuel.bypass-line': box(205, 240, 55, 160), 'fuel.canister': box(32, 330, 85, 75), 'fuel.adapter': box(160, 350, 60, 50),
  'navigator.route': box(455, 292, 90, 58), 'navigator.voice-keys': box(535, 355, 55, 35), 'navigator.warning': box(575, 275, 25, 28), 'navigator.finish-flag': box(430, 365, 32, 38),
  'glovebox.pocket-and-screen': box(625, 315, 100, 65), 'glovebox.service-book': box(670, 395, 70, 48), 'glovebox.visor-card': box(735, 300, 35, 45),
  'wipers.rain-sensor': box(390, 190, 45, 35), 'wipers.wiper-arms': box(275, 270, 210, 42), 'wipers.timer': box(520, 215, 48, 32),
  'hitch.socket': box(1000, 340, 70, 55), 'hitch.park-sensors': box(955, 390, 90, 32), 'hitch.roof-boxes': box(620, 145, 220, 58), 'hitch.trailer': box(1090, 260, 170, 150), 'hitch.rear-camera': box(975, 480, 50, 40),
  'convoy.load-sticker': box(1010, 90, 45, 22), 'convoy.radio': box(945, 185, 45, 35), 'convoy.safety-kit': box(1180, 150, 55, 55), 'convoy.formation': box(1100, 35, 80, 35), 'convoy.follower': box(1080, 75, 180, 120),
  'atlas.book': box(635, 405, 95, 70), 'atlas.lens': box(735, 445, 35, 35), 'atlas.check-marks': box(650, 480, 70, 25), 'atlas.printouts': box(605, 475, 45, 45), 'atlas.bookmark': box(710, 390, 18, 48),
  'dyno.engine-cutaway': box(810, 470, 120, 100), 'dyno.additive-barrel': box(945, 495, 70, 75), 'dyno.tuning-chip': box(1015, 520, 48, 35), 'dyno.gauge': box(1060, 410, 65, 80), 'dyno.small-engine': box(855, 570, 110, 75),
  'computer.unit': box(515, 350, 90, 45), 'computer.antenna': box(795, 170, 35, 120), 'computer.cartridge': box(545, 385, 52, 35), 'computer.immobilizer': box(765, 350, 45, 38), 'computer.dashboard': box(440, 245, 190, 45),
}
