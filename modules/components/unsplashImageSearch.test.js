jest.mock('./unsplashImageSearch');
import { apiGetPhotos } from "./unsplashImageSearch";

it('should have object results', async () => {
  const response = await apiGetPhotos({});
  expect(response.response.results).toBeDefined();
})