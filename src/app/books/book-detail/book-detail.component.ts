import { Component, OnInit } from "@angular/core";
import { Book } from "src/app/models/book";
import { ActivatedRoute } from "@angular/router";
import { BookService } from "src/app/_services/book.service";
import { AuthorService } from "src/app/_services/author.service";
import { Author } from "src/app/models/author";
import { User } from "src/app/models/user";
import { AccountService } from "src/app/_services/account.service";
import { take } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { BookParams } from "src/app/models/bookParams";
import { ReviewParams } from "src/app/models/reviewParams";
import { ReviewService } from "src/app/_services/review.service";
import { Review } from "src/app/models/review";
import { CategoryService } from "src/app/_services/category.service";
import { Category } from "src/app/models/category";
import { PublisherService } from "src/app/_services/publisher.service";
import { CartService } from "src/app/_services/cart.service";

@Component({
  selector: "app-book-detail",
  templateUrl: "./book-detail.component.html",
  styleUrls: ["./book-detail.component.css"],
})
export class BookDetailComponent implements OnInit {
  book: Book;
  books: Book[];
  categories: Category[];
  authors: Author[];
  reviews: Review[];
  user: any;
  a = 0;
  name: string = "";
  bookIds: Book[] = [];
  reviewParams: ReviewParams;
  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private authorService: AuthorService,
    private accountService: AccountService,
    private toastr: ToastrService,
    private reviewService: ReviewService,
    private categoryService: CategoryService,
    private publisherService: PublisherService,
    private cartService: CartService
  ) {
    accountService.currentUser$.pipe(take(1)).subscribe((user) => {
      this.user = user;
      this.reviewParams = new ReviewParams(user);
    });
  }

  ngOnInit(): void {
    this.loadBook();
    this.getReview();
  }
  role() {
    let role = this.user.roles.toString();
    return role;
  }
  displayCategory(book: Book) {
    let name: string[] = [];
    let categories = book.bookCategories;
    categories.forEach((element) => {
      name.push(" " + element.category.name);
    });
    return name;
  }
  displayPublisher() {
    return this.name;
  }

  count(book: Book) {
    return book.reviews.length;
  }

  loadplsher(id: number) {
    this.publisherService.getPublisher(id).subscribe((response) => {
      this.name = response.name;
    });
  }

  displayAuthors(book: Book) {
    let name: string[] = [];
    let authors = book.authorBooks;
    authors.slice(1).forEach((element) => {
      name.push(" " + element.author.fullName);
    });
    return name;
  }
  
  addToCart(accountId: number, book: Book, quantity: number) {
    this.bookIds.push(book);
    console.log(this.user);

    if (this.user?.roles == undefined) {
      this.toastr.error("Vui lòng đăng nhập trước khi mua hàng !");
    } else {
      this.cartService
        .addToCart(accountId, this.bookIds, quantity)
        .subscribe((response) => {
          this.toastr.info("Đã thêm sách vào giỏ hàng");
          console.log(response);
        });
    }
  }

  loadBook() {
    this.bookService
      .getBook(this.route.snapshot.paramMap.get("bookId"))
      .subscribe((book) => {
        this.book = book;
        console.log(book);

        this.reviewParams.bookId = book.id;
        this.loadAuthorByBook(book.id);
        this.loadplsher(book.publisherId);
      });
  }
  loadAuthorByBook(id: number) {
    this.authorService.getAuthorByBook(id).subscribe((authors) => {
      this.authors = authors;
    });
  }
  addLike(id: number) {
    this.reviewService.addLike(this.reviewParams).subscribe(
      () => {
        this.toastr.success("Bạn đã thích sách " + this.book.title);
        location.href = "books/" + id;
      },
      (error) => {
        console.log(error);
        this.toastr.error(error.error);
      }
    );
  }
  getReview() {
    this.reviewService.getReviews().subscribe((reviews) => {
      this.reviews = reviews;
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((response) => {
      this.categories = response;
    });
  }
}
