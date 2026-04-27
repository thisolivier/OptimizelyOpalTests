import { ParameterType, tool } from '@optimizely-opal/opal-tools-sdk';
import { z } from "zod";

// {
//   "id": "article-123",
//   "title": "The Future of AI in Marketing",
//   "author": "Jane Doe",
//   "body": "<p>Artificial intelligence is rapidly transforming the marketing landscape...</p><p>Key areas include personalization, automation, and data analysis.</p>",
//   "imageUrl": "https://example.com/ai-marketing.jpg",
//   "publishDate": "2025-01-15",
//   "externalLink": "https://external-cms.com/articles/ai-marketing"
// }

const ArticleSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  author: z.string().optional(),
  body: z.string().optional(),
  imageUrl: z.url().optional(),
  publishDate: z.string().optional(),
  externalLink: z.url().optional(),
});

const CMSPreviewInputSchema = z.object({
  articleId: z.string()
})

type Article = z.infer<typeof ArticleSchema>;
type CMSPrevieInput = z.infer<typeof CMSPreviewInputSchema>

export class  CMSPreviewTools {
  static urlArticle = "http://localhost:4000/api/cms/articles/"

  @tool({
    name: 'preview_cms',
    description: 'Generates HTML to preview the content in the CMS',
    parameters: [
      {
        name: 'articleId',
        type: ParameterType.String,
        description: 'The ID of the article in the CMS system',
        required: true
      }
    ]
  })
  async previewCMS(params: CMSPrevieInput) {
    const inputResult = CMSPreviewInputSchema.safeParse(params)
    if (!inputResult.success) {
      return {
        status: 400,
        error: z.treeifyError(inputResult.error),
      };
    }
    const {articleId} = inputResult.data
    let res: Response;
    try {
      res = await fetch(CMSPreviewTools.urlArticle + articleId);
    } catch (e) {
      return {
        status: 502,
        error: `[CMS_FETCH_FAILED] Could not reach CMS at ${CMSPreviewTools.urlArticle}${articleId}: ${(e as Error).message}`,
      };
    }
    if (!res.ok) {
      return {
        status: res.status,
        error: `[CMS_FETCH_FAILED] CMS responded with HTTP ${res.status} ${res.statusText} for articleId="${articleId}"`,
      };
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch (e) {
      return {
        status: 502,
        error: `[CMS_RESPONSE_INVALID] CMS returned non-JSON body for articleId="${articleId}": ${(e as Error).message}`,
      };
    }
    const articleResult = ArticleSchema.safeParse(json);
    if (!articleResult.success) {
      return {
        status: 502,
        error: `[CMS_RESPONSE_INVALID] CMS payload failed schema validation for articleId="${articleId}": ${JSON.stringify(z.treeifyError(articleResult.error))}`,
      };
    }
    const article: Article = articleResult.data
    return `<!DOCTYPE html><html>
<head><title>Article Preview ${articleId}<\\title><\\head>
<h1>${article.title ?? "NO TITLE IN CMS"}<\\h1>
<p>${article.body ?? "NO BODY IN CMS"}<\\p>
    `
  }
}