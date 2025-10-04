import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
};

/** A collection of posts. */
export type Collection = TopicableInterface & {
  __typename?: 'Collection';
  /** Cover image for the collection. */
  coverImage?: Maybe<Scalars['String']['output']>;
  /** Identifies the date and time when collection was created. */
  createdAt: Scalars['DateTime']['output'];
  /** Description of the collection in plain text. */
  description?: Maybe<Scalars['String']['output']>;
  /** Identifies the date and time when collection was featured. */
  featuredAt?: Maybe<Scalars['DateTime']['output']>;
  /** Number of users following the collection. */
  followersCount: Scalars['Int']['output'];
  /** ID of the collection. */
  id: Scalars['ID']['output'];
  /** Whether the viewer is following the collection or not. */
  isFollowing: Scalars['Boolean']['output'];
  /** Name of the collection. */
  name: Scalars['String']['output'];
  /** Lookup posts which are part of the collection. */
  posts: PostConnection;
  /** Tagline of the collection. */
  tagline: Scalars['String']['output'];
  /** Look up topics that are associated with the object. */
  topics: TopicConnection;
  /** Public URL of the goal. */
  url: Scalars['String']['output'];
  /** User who created the collection. */
  user: User;
  /** ID of User who created the collection. */
  userId: Scalars['ID']['output'];
};


/** A collection of posts. */
export type CollectionpostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A collection of posts. */
export type CollectiontopicsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** The connection type for Collection. */
export type CollectionConnection = {
  __typename?: 'CollectionConnection';
  /** A list of edges. */
  edges: Array<CollectionEdge>;
  /** A list of nodes. */
  nodes: Array<Collection>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Total number of objects returned from this query */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type CollectionEdge = {
  __typename?: 'CollectionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Collection;
};

export enum CollectionsOrder {
  /** Returns Collections in descending order of featured date. */
  FEATURED_AT = 'FEATURED_AT',
  /** Returns Collections in descending order of followers count. */
  FOLLOWERS_COUNT = 'FOLLOWERS_COUNT',
  /** Returns Collections in descending order of creation date. */
  NEWEST = 'NEWEST'
}

/** A comment posted by a User. */
export type Comment = VotableInterface & {
  __typename?: 'Comment';
  /** Body of the comment. */
  body: Scalars['String']['output'];
  /** Identifies the date and time when comment was created. */
  createdAt: Scalars['DateTime']['output'];
  /** ID of the comment. */
  id: Scalars['ID']['output'];
  /** Whether the Viewer has voted for the object or not. */
  isVoted: Scalars['Boolean']['output'];
  /** Comment on which this comment was posted(null in case of top level comments). */
  parent?: Maybe<Comment>;
  /** ID of Comment on which this comment was posted(null in case of top level comments). */
  parentId?: Maybe<Scalars['ID']['output']>;
  /** Lookup comments that were posted on the comment itself. */
  replies: CommentConnection;
  /** Public URL of the comment. */
  url: Scalars['String']['output'];
  /** User who posted the comment. */
  user: User;
  /** ID of User who posted the comment. */
  userId: Scalars['ID']['output'];
  votes: VoteConnection;
  /** Number of votes that the object has currently. */
  votesCount: Scalars['Int']['output'];
};


/** A comment posted by a User. */
export type CommentrepliesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<CommentsOrder>;
};


/** A comment posted by a User. */
export type CommentvotesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAfter?: InputMaybe<Scalars['DateTime']['input']>;
  createdBefore?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** The connection type for Comment. */
export type CommentConnection = {
  __typename?: 'CommentConnection';
  /** A list of edges. */
  edges: Array<CommentEdge>;
  /** A list of nodes. */
  nodes: Array<Comment>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Total number of objects returned from this query */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type CommentEdge = {
  __typename?: 'CommentEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Comment;
};

export enum CommentsOrder {
  /** Returns Comments in descending order of creation date. */
  NEWEST = 'NEWEST',
  /** Returns Comments in descending order of votes count. */
  VOTES_COUNT = 'VOTES_COUNT'
}

export type Error = {
  __typename?: 'Error';
  /** Field for which the error occurred. */
  field: Scalars['String']['output'];
  /** Error message. */
  message: Scalars['String']['output'];
};

/** A media object. */
export type Media = {
  __typename?: 'Media';
  /** Type of media object. */
  type: Scalars['String']['output'];
  /** Public URL for the media object. Incase of videos this URL represents thumbnail generated from video. */
  url: Scalars['String']['output'];
  /** Video URL of the media object. */
  videoUrl?: Maybe<Scalars['String']['output']>;
};


/** A media object. */
export type MediaurlArgs = {
  height?: InputMaybe<Scalars['Int']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Follow a User as Viewer. Returns the followed User. */
  userFollow: UserFollowPayload;
  /** Stop following a User as Viewer. Returns the un-followed User. */
  userFollowUndo: UserFollowUndoPayload;
};


export type MutationuserFollowArgs = {
  input: UserFollowInput;
};


export type MutationuserFollowUndoArgs = {
  input: UserFollowUndoInput;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** A post. */
export type Post = TopicableInterface & VotableInterface & {
  __typename?: 'Post';
  /** Lookup collections which the Post is part of. */
  collections: CollectionConnection;
  /** Lookup comments on the Post. */
  comments: CommentConnection;
  /** Number of comments made on the Post. */
  commentsCount: Scalars['Int']['output'];
  /** Identifies the date and time when the Post was created. */
  createdAt: Scalars['DateTime']['output'];
  /** Daily rank of the Post. */
  dailyRank?: Maybe<Scalars['Int']['output']>;
  /** Description of the Post in plain text. */
  description?: Maybe<Scalars['String']['output']>;
  /** Identifies the date and time when the Post was featured. */
  featuredAt?: Maybe<Scalars['DateTime']['output']>;
  /** ID of the Post. */
  id: Scalars['ID']['output'];
  /** Whether the viewer has added the Post to one of their collections. */
  isCollected: Scalars['Boolean']['output'];
  /** Whether the Viewer has voted for the object or not. */
  isVoted: Scalars['Boolean']['output'];
  /** Users who are marked as makers of the Post. */
  makers: Array<User>;
  /** Media items for the Post. */
  media: Array<Media>;
  /** Monthly rank of the Post. */
  monthlyRank?: Maybe<Scalars['Int']['output']>;
  /** Name of the Post. */
  name: Scalars['String']['output'];
  /** Additional product links */
  productLinks: Array<ProductLink>;
  /** Count of review for the Post */
  reviewsCount: Scalars['Int']['output'];
  /** Aggregate review rating for the Post. */
  reviewsRating: Scalars['Float']['output'];
  /** Identifies the date and time when the Post was scheduled. */
  scheduledAt?: Maybe<Scalars['DateTime']['output']>;
  /** URL friendly slug of the Post. */
  slug: Scalars['String']['output'];
  /** Tagline of the Post. */
  tagline: Scalars['String']['output'];
  /** Thumbnail media object of the Post. */
  thumbnail?: Maybe<Media>;
  /** Look up topics that are associated with the object. */
  topics: TopicConnection;
  /** URL of the Post on Product Hunt. */
  url: Scalars['String']['output'];
  /** User who created the Post. */
  user: User;
  /** ID of User who created the Post. */
  userId: Scalars['ID']['output'];
  votes: VoteConnection;
  /** Number of votes that the object has currently. */
  votesCount: Scalars['Int']['output'];
  /** URL that redirects to the Post's website. */
  website: Scalars['String']['output'];
  /** Weekly rank of the Post. */
  weeklyRank?: Maybe<Scalars['Int']['output']>;
  /** Yearly rank of the Post. */
  yearlyRank?: Maybe<Scalars['Int']['output']>;
};


/** A post. */
export type PostcollectionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A post. */
export type PostcommentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<CommentsOrder>;
};


/** A post. */
export type PosttopicsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A post. */
export type PostvotesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAfter?: InputMaybe<Scalars['DateTime']['input']>;
  createdBefore?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** The connection type for Post. */
export type PostConnection = {
  __typename?: 'PostConnection';
  /** A list of edges. */
  edges: Array<PostEdge>;
  /** A list of nodes. */
  nodes: Array<Post>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Total number of objects returned from this query */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type PostEdge = {
  __typename?: 'PostEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Post;
};

export enum PostsOrder {
  /** Returns Posts in descending order of featured date. */
  FEATURED_AT = 'FEATURED_AT',
  /** Returns Posts in descending order of creation date. */
  NEWEST = 'NEWEST',
  /** Returns Posts in descending order of ranking. */
  RANKING = 'RANKING',
  /** Returns Posts in descending order of votes count. */
  VOTES = 'VOTES'
}

/** Product link from a post. */
export type ProductLink = {
  __typename?: 'ProductLink';
  type: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

/** The query root for Product Hunt API V2 schema */
export type Query = {
  __typename?: 'Query';
  /** Look up a Collection(only published). */
  collection?: Maybe<Collection>;
  /** Look up Collections by various parameters. */
  collections: CollectionConnection;
  /** Look up a Comment. */
  comment?: Maybe<Comment>;
  /** Look up a Post. */
  post?: Maybe<Post>;
  /** Look up Posts by various parameters. */
  posts: PostConnection;
  /** Look up a Topic. */
  topic?: Maybe<Topic>;
  /** Look up Topics by various parameters. */
  topics: TopicConnection;
  /** Look up a User. */
  user?: Maybe<User>;
  /** Top level scope for currently authenticated user. */
  viewer?: Maybe<Viewer>;
};


/** The query root for Product Hunt API V2 schema */
export type QuerycollectionArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for Product Hunt API V2 schema */
export type QuerycollectionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<CollectionsOrder>;
  postId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


/** The query root for Product Hunt API V2 schema */
export type QuerycommentArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for Product Hunt API V2 schema */
export type QuerypostArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for Product Hunt API V2 schema */
export type QuerypostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<PostsOrder>;
  postedAfter?: InputMaybe<Scalars['DateTime']['input']>;
  postedBefore?: InputMaybe<Scalars['DateTime']['input']>;
  topic?: InputMaybe<Scalars['String']['input']>;
  twitterUrl?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for Product Hunt API V2 schema */
export type QuerytopicArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for Product Hunt API V2 schema */
export type QuerytopicsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  followedByUserid?: InputMaybe<Scalars['ID']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<TopicsOrder>;
  query?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for Product Hunt API V2 schema */
export type QueryuserArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** A topic. */
export type Topic = {
  __typename?: 'Topic';
  /** Identifies the date and time when topic was created. */
  createdAt: Scalars['DateTime']['output'];
  /** Description of the topic. */
  description: Scalars['String']['output'];
  /** Number of users who are following the topic. */
  followersCount: Scalars['Int']['output'];
  /** ID of the topic. */
  id: Scalars['ID']['output'];
  /** Image of the topic. */
  image?: Maybe<Scalars['String']['output']>;
  /** Whether the viewer is following the topic or not. */
  isFollowing: Scalars['Boolean']['output'];
  /** Name of the topic. */
  name: Scalars['String']['output'];
  /** Number of posts that are part of the topic. */
  postsCount: Scalars['Int']['output'];
  /** URL friendly slug of the topic. */
  slug: Scalars['String']['output'];
  /** Public URL of the topic. */
  url: Scalars['String']['output'];
};


/** A topic. */
export type TopicimageArgs = {
  height?: InputMaybe<Scalars['Int']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

/** The connection type for Topic. */
export type TopicConnection = {
  __typename?: 'TopicConnection';
  /** A list of edges. */
  edges: Array<TopicEdge>;
  /** A list of nodes. */
  nodes: Array<Topic>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Total number of objects returned from this query */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type TopicEdge = {
  __typename?: 'TopicEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Topic;
};

/** An object that can have topics associated with it. */
export type TopicableInterface = {
  /** ID of the object. */
  id: Scalars['ID']['output'];
  /** Look up topics that are associated with the object. */
  topics: TopicConnection;
};


/** An object that can have topics associated with it. */
export type TopicableInterfacetopicsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export enum TopicsOrder {
  /** Returns Topics in descending order of followers count. */
  FOLLOWERS_COUNT = 'FOLLOWERS_COUNT',
  /** Returns Topics in descending order of creation date. */
  NEWEST = 'NEWEST'
}

/** A user. The data is only available for the currently-accessing user, otherwise all of it will be redacted to protect other users' privacy. */
export type User = {
  __typename?: 'User';
  /** Cover image of the user. */
  coverImage?: Maybe<Scalars['String']['output']>;
  /** Identifies the date and time when user was created. */
  createdAt: Scalars['DateTime']['output'];
  /** Look up collections that the user is following. */
  followedCollections: CollectionConnection;
  /** [REDACTED] Look up other users who are following the user (Always empty for privacy reasons). */
  followers: UserConnection;
  /** [REDACTED] Look up other users who are being followed by the user (Always empty for privacy reasons) */
  following: UserConnection;
  /** Headline text of the user. */
  headline?: Maybe<Scalars['String']['output']>;
  /** ID of the user. */
  id: Scalars['ID']['output'];
  /** [REDACTED] Whether the viewer is following the user or not (Always false for privacy reasons). */
  isFollowing?: Maybe<Scalars['Boolean']['output']>;
  /** Whether the user is an accepted maker or not. */
  isMaker: Scalars['Boolean']['output'];
  /** Whether the user is same as the viewer of the API. */
  isViewer: Scalars['Boolean']['output'];
  /** Look up posts that the user has made. */
  madePosts: PostConnection;
  /** Name of the user. */
  name: Scalars['String']['output'];
  /** Profile image of the user. */
  profileImage?: Maybe<Scalars['String']['output']>;
  /** Look up posts that the user has submitted. */
  submittedPosts: PostConnection;
  /** Twitter username of the user. */
  twitterUsername?: Maybe<Scalars['String']['output']>;
  /** Public URL of the user's profile */
  url: Scalars['String']['output'];
  /** Username of the user. */
  username: Scalars['String']['output'];
  /** Look up posts that the user has voted for. */
  votedPosts: PostConnection;
  /** URL for the user's website */
  websiteUrl?: Maybe<Scalars['String']['output']>;
};


/** A user. The data is only available for the currently-accessing user, otherwise all of it will be redacted to protect other users' privacy. */
export type UsercoverImageArgs = {
  height?: InputMaybe<Scalars['Int']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};


/** A user. The data is only available for the currently-accessing user, otherwise all of it will be redacted to protect other users' privacy. */
export type UserfollowedCollectionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A user. The data is only available for the currently-accessing user, otherwise all of it will be redacted to protect other users' privacy. */
export type UserfollowersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A user. The data is only available for the currently-accessing user, otherwise all of it will be redacted to protect other users' privacy. */
export type UserfollowingArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A user. The data is only available for the currently-accessing user, otherwise all of it will be redacted to protect other users' privacy. */
export type UsermadePostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A user. The data is only available for the currently-accessing user, otherwise all of it will be redacted to protect other users' privacy. */
export type UserprofileImageArgs = {
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** A user. The data is only available for the currently-accessing user, otherwise all of it will be redacted to protect other users' privacy. */
export type UsersubmittedPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A user. The data is only available for the currently-accessing user, otherwise all of it will be redacted to protect other users' privacy. */
export type UservotedPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** The connection type for User. */
export type UserConnection = {
  __typename?: 'UserConnection';
  /** A list of edges. */
  edges: Array<UserEdge>;
  /** A list of nodes. */
  nodes: Array<User>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Total number of objects returned from this query */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type UserEdge = {
  __typename?: 'UserEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: User;
};

/** Autogenerated input type of UserFollow */
export type UserFollowInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** ID of the User to follow. */
  userId: Scalars['ID']['input'];
};

/** Autogenerated return type of UserFollow. */
export type UserFollowPayload = {
  __typename?: 'UserFollowPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  errors: Array<Error>;
  node?: Maybe<User>;
};

/** Autogenerated input type of UserFollowUndo */
export type UserFollowUndoInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** ID of the User to stop following. */
  userId: Scalars['ID']['input'];
};

/** Autogenerated return type of UserFollowUndo. */
export type UserFollowUndoPayload = {
  __typename?: 'UserFollowUndoPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  errors: Array<Error>;
  node?: Maybe<User>;
};

/** Top level scope for the user in whose context the API is running. */
export type Viewer = {
  __typename?: 'Viewer';
  /** User who is the viewer of the API. */
  user: User;
};

/** An object which users can vote for. */
export type VotableInterface = {
  /** ID of the object */
  id: Scalars['ID']['output'];
  /** Whether the Viewer has voted for the object or not. */
  isVoted: Scalars['Boolean']['output'];
  votes: VoteConnection;
  /** Number of votes that the object has currently. */
  votesCount: Scalars['Int']['output'];
};


/** An object which users can vote for. */
export type VotableInterfacevotesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAfter?: InputMaybe<Scalars['DateTime']['input']>;
  createdBefore?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** A vote. */
export type Vote = {
  __typename?: 'Vote';
  /** Identifies the date and time when Vote was created. */
  createdAt: Scalars['DateTime']['output'];
  /** ID of the Vote. */
  id: Scalars['ID']['output'];
  /** User who created the Vote. */
  user: User;
  /** ID of User who created the Vote. */
  userId: Scalars['ID']['output'];
};

/** The connection type for Vote. */
export type VoteConnection = {
  __typename?: 'VoteConnection';
  /** A list of edges. */
  edges: Array<VoteEdge>;
  /** A list of nodes. */
  nodes: Array<Vote>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Total number of objects returned from this query */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a connection. */
export type VoteEdge = {
  __typename?: 'VoteEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Vote;
};

export type GetCollectionsQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetCollectionsQuery = { __typename?: 'Query', collections: { __typename?: 'CollectionConnection', totalCount: number, edges: Array<{ __typename?: 'CollectionEdge', node: { __typename?: 'Collection', id: string, name: string, tagline: string, description?: string | null, url: string, followersCount: number, featuredAt?: string | null, coverImage?: string | null, createdAt: string, user: { __typename?: 'User', id: string, name: string, username: string }, posts: { __typename?: 'PostConnection', totalCount: number } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetPostsQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  postedAfter?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type GetPostsQuery = { __typename?: 'Query', posts: { __typename?: 'PostConnection', totalCount: number, edges: Array<{ __typename?: 'PostEdge', cursor: string, node: { __typename?: 'Post', id: string, name: string, tagline: string, description?: string | null, url: string, website: string, votesCount: number, commentsCount: number, createdAt: string, featuredAt?: string | null, thumbnail?: { __typename?: 'Media', type: string, url: string, videoUrl?: string | null } | null, media: Array<{ __typename?: 'Media', type: string, url: string, videoUrl?: string | null }>, user: { __typename?: 'User', id: string, name: string, username: string, headline?: string | null, coverImage?: string | null, createdAt: string }, topics: { __typename?: 'TopicConnection', edges: Array<{ __typename?: 'TopicEdge', node: { __typename?: 'Topic', id: string, name: string, description: string, slug: string, followersCount: number } }> }, collections: { __typename?: 'CollectionConnection', totalCount: number }, comments: { __typename?: 'CommentConnection', totalCount: number, edges: Array<{ __typename?: 'CommentEdge', node: { __typename?: 'Comment', id: string, body: string, createdAt: string, votesCount: number, isVoted: boolean, parentId?: string | null, url: string, userId: string, user: { __typename?: 'User', id: string, name: string, username: string, headline?: string | null, coverImage?: string | null } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };

export type GetTopicsQueryVariables = Exact<{
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetTopicsQuery = { __typename?: 'Query', topics: { __typename?: 'TopicConnection', totalCount: number, edges: Array<{ __typename?: 'TopicEdge', node: { __typename?: 'Topic', id: string, name: string, description: string, slug: string, followersCount: number, postsCount: number, createdAt: string, image?: string | null, url: string } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } };


export const GetCollectionsDocument = gql`
    query GetCollections($first: Int!, $after: String) {
  collections(first: $first, after: $after) {
    edges {
      node {
        id
        name
        tagline
        description
        url
        followersCount
        featuredAt
        coverImage
        createdAt
        user {
          id
          name
          username
        }
        posts(first: 1) {
          totalCount
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;
export const GetPostsDocument = gql`
    query GetPosts($first: Int!, $after: String, $postedAfter: DateTime) {
  posts(first: $first, after: $after, postedAfter: $postedAfter) {
    edges {
      node {
        id
        name
        tagline
        description
        url
        website
        votesCount
        commentsCount
        createdAt
        featuredAt
        thumbnail {
          type
          url
          videoUrl
        }
        media {
          type
          url
          videoUrl
        }
        user {
          id
          name
          username
          headline
          coverImage
          createdAt
        }
        topics {
          edges {
            node {
              id
              name
              description
              slug
              followersCount
            }
          }
        }
        collections(first: 1) {
          totalCount
        }
        comments(first: 5) {
          edges {
            node {
              id
              body
              createdAt
              votesCount
              isVoted
              parentId
              url
              userId
              user {
                id
                name
                username
                headline
                coverImage
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;
export const GetTopicsDocument = gql`
    query GetTopics($first: Int!, $after: String) {
  topics(first: $first, after: $after) {
    edges {
      node {
        id
        name
        description
        slug
        followersCount
        postsCount
        createdAt
        image
        url
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    GetCollections(variables: GetCollectionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetCollectionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCollectionsQuery>({ document: GetCollectionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetCollections', 'query', variables);
    },
    GetPosts(variables: GetPostsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetPostsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPostsQuery>({ document: GetPostsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetPosts', 'query', variables);
    },
    GetTopics(variables: GetTopicsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetTopicsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTopicsQuery>({ document: GetTopicsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetTopics', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;