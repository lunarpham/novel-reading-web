import { StoryQueryService } from "./query";
import { StoryMutationService } from "./mutation";
import { PaginationParams } from "../../interfaces/_index";
import { StorySearchParams, StoryUpdateData } from "../../interfaces/story";
import { StoryCreationData } from "../../interfaces/story";

export class StoryService {
  constructor(
    private queryService = new StoryQueryService(),
    private mutationService = new StoryMutationService()
  ) {}

  // Search and retrieval methods
  async getAllStories(params: PaginationParams) {
    return this.queryService.getAllStories(params);
  }

  async getStoryById(id: number) {
    return this.queryService.getStoryById(id);
  }

  async searchStories(params: StorySearchParams) {
    return this.queryService.getAllStories(params);
  }

  async createStory(data: StoryCreationData, authorId: number) {
    return this.mutationService.createStory(data, authorId);
  }

  async updateStory(
    storyId: number,
    storyData: StoryUpdateData,
    authorId: number
  ) {
    return this.mutationService.updateStory(storyId, storyData, authorId);
  }

  async deleteStory(storyId: number, authorId: number) {
    return this.mutationService.deleteStory(storyId, authorId);
  }
}
