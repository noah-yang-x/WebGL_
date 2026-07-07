export const repositoryName = import.meta.env.VITE_BASE_PATH ?? '';
export const baseUrl = repositoryName ? `/${repositoryName}` : '';
