import { HomeTabOption, NodeDetail, TopicDetail, TopicReply, MemberDetail, NodeBasic } from "@/types/v2ex";

type EntityResponse<T, M = null> = {
  data: T,
  meta?: M,
  fetchedAt?: number,
}

type PaginatedResponse<T, Meta = null> = {
  data: T[],
  pagination: {
    current: number,
    total: number,
  },
  meta?: Mata,
  fetchedAt?: number,
}

type CollectionResponse<T> = {
  data: T[],
  fetchedAt?: number,
}

type StatusResponse<T = null, M = null> = {
  success: boolean,
  message: string,
  data?: T,
  meta?: M,
}

type TopicId = string | number;
type ReplyId = string | number;
