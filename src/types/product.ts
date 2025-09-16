export interface Product {
    _id: string;       // Mongo id (hoặc id string)     // nếu backend trả id thay vì _id
  name: string;
  description?: string;
  average_rating: number;
  rating_count: number;
  category?: {
    _id: string;
    name : string;
  };
  images?: string[];     // url avatar/image
  createdAt?: string;
  updatedAt?: string;
  creatorId: string;
}