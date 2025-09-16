import { ChapterQueryService } from "./query";
import { ChapterUploadService } from "./upload";
import { PaginatedResponse } from "../../interfaces/_index";
import {
  ChapterBasic,
  ChapterDetail,
  ChapterSearchParams,
  ChapterCreationData,
  ChapterUpdateData,
} from "../../interfaces/chapter";

export class ChapterService {
  constructor(
    private queryService = new ChapterQueryService(),
    private uploadService = new ChapterUploadService()
  ) {}

  // Delegate to query service
  get query() {
    return this.queryService;
  }

  // Delegate to upload service
  get upload() {
    return this.uploadService;
  }

  // Direct methods for common operations
  async getChapterById(
    id: number,
    showContent: boolean = false
  ): Promise<ChapterDetail | null> {
    return this.queryService.getChapterById(id, showContent);
  }

  async getAllChapters(
    params: ChapterSearchParams = {}
  ): Promise<PaginatedResponse<ChapterBasic>> {
    return this.queryService.getAllChapters(params);
  }

  async createChapter(
    data: ChapterCreationData,
    authorId: number
  ): Promise<ChapterDetail> {
    return this.uploadService.createChapter(data, authorId);
  }

  async updateChapter(
    id: number,
    data: ChapterUpdateData,
    authorId: number
  ): Promise<ChapterDetail> {
    return this.uploadService.updateChapter(id, data, authorId);
  }

  async deleteChapter(id: number, authorId: number): Promise<void> {
    return this.uploadService.deleteChapter(id, authorId);
  }
}
