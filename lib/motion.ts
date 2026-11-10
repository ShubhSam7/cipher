export const durations = { fast: .12, normal: .16, slow: .32, ambient: 28 };
export const easeOut = [.22, 1, .36, 1] as const;
export const easePop = [.34, 1.56, .64, 1] as const;
export const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: durations.slow, ease: easeOut } } };
export const stagger = { hidden: {}, show: { transition: { staggerChildren: .06 } } };
export const fadeSlide = { hidden: { opacity: 0, x: 12 }, show: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -12 } };
export const growX = { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: .5, ease: easeOut } } };
export const floatY = { y: [0, -6, 0], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const } };
