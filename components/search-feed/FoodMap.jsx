import { FoodMapDataProvider } from "./FoodMap/FoodMapDataProvider";
import FoodMapView from "./FoodMap/FoodMapView";

export default function FoodMap() {
  return (
    <FoodMapDataProvider>
      <FoodMapView />
    </FoodMapDataProvider>
  );
}
