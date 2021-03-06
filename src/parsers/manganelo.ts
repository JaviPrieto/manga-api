import {
  Chapter,
  ChapterEntry,
  Genre,
  Manga,
  MangaParser,
  Status,
  ParsingResult,
  ParsingError,
  // @ts-ignore deno-lint-ignore
} from "../types/index.ts";

// @ts-ignore deno-lint-ignore
import { cheerio } from "../deps.ts";

/**
 * Parse for the [Manganelo](https://manganelo.com/) manga site.
 */
export class ManganeloParser implements MangaParser {
  parse(html: string): ParsingResult<Manga> {
    const title = this.parseTitle(html);
    const alternativeTitles = this.parseAlternativeTitles(html);
    const status = this.parseStatus(html);
    const genres = this.parseGenres(html);
    const chaptersEntries = this.parseChapters(html);

    const firstErrorInParsing =
      title.error ||
      alternativeTitles.error ||
      status.error ||
      genres.error ||
      chaptersEntries.error;

    return {
      data: {
        title: title.data,
        alternativeTitles: alternativeTitles.data,
        status: status.data,
        genres: genres.data,
        chapters: [],
        chaptersEntries: chaptersEntries.data,
      },
      error: firstErrorInParsing,
    };
  }

  parseTitle(html: string): ParsingResult<string> {
    const $ = cheerio.load(html);
    const title = $("h1").text();
    const error = title ? undefined : new ParsingError("Title");
    return { data: title, error };
  }

  parseAlternativeTitles(html: string): ParsingResult<string[]> {
    const $ = cheerio.load(html);
    const alternativeTitles = $(
      ".variations-tableInfo tbody tr:nth-child(1) td:nth-child(2) h2"
    )
      .text()
      .split(";")
      .map((e: string) => e.trim());
    const error = alternativeTitles
      ? undefined
      : new ParsingError("Alternitve Titles");
    return { data: alternativeTitles, error };
  }
  parseStatus(html: string): ParsingResult<Status> {
    const $ = cheerio.load(html);
    const statusText = $(
      ".variations-tableInfo tbody tr:nth-child(3) td:nth-child(2)"
    ).text();
    const status = Status[(statusText as unknown) as keyof typeof Status];
    const error = status ? undefined : new ParsingError("Status");
    return { data: status, error };
  }

  parseGenres(html: string): ParsingResult<Genre[]> {
    const $ = cheerio.load(html);
    const genres = $(
      ".variations-tableInfo tbody tr:nth-child(4) td:nth-child(2) a"
    )
      .map((i: number, e: CheerioElement) => $(e).text())
      .get()
      .map((g: Genre) => Genre[(g as unknown) as keyof typeof Genre]);
    const error = genres ? undefined : new ParsingError("Genres");
    return { data: genres, error };
  }

  parseChapters(html: string): ParsingResult<ChapterEntry[]> {
    const $ = cheerio.load(html);
    const chapters = $(".row-content-chapter .a-h .chapter-name")
      .map((i: number, e: CheerioElement) => ({ url: $(e).attr("href") }))
      .get();
    const error = chapters ? undefined : new ParsingError("Genres");
    return { data: chapters, error };
  }

  parseChapter(html: string): ParsingResult<Chapter> {
    const $ = cheerio.load(html);
    const chapters = $(".container-chapter-reader")
      .contents()
      .map((i: number, e: cheerio) => $(e).attr("src"))
      .get();
    const chapter: Chapter = {
      title: $("h1").text(),
      chapterPages: chapters.map((url: string) => ({ url: url })),
    };

    const error =
      chapter.title && chapter.chapterPages
        ? undefined
        : new ParsingError(`Chapter(${chapter.title})`);
    return { data: chapter, error };
  }
}
