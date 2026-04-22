// Tender OS stub: the upstream game talks to a multiplayer server.
// We run it offline, so socket ops are no-ops.
const noop = () => {};
export default { emit: noop, on: noop, once: noop, off: noop };
