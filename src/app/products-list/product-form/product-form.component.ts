import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { product } from '../../Models/product.interface';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatError, MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ErrorLogsService } from '../../services/error-logs.service';
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, MatIconModule, MatError , MatButtonModule, MatGridListModule, MatFormFieldModule, MatInputModule, ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {
 productForm: FormGroup;
  isEdit = false;
  productId: string | null = null;
  log = inject(ErrorLogsService)
  formBuilder: FormBuilder = inject(FormBuilder);
  productService:ProductService = inject(ProductService);
  router: Router = inject(Router);
  activeRoute: ActivatedRoute = inject(ActivatedRoute);

  constructor() {
  
  }

  ngOnInit() {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],

    });

    this.activeRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.productId = id;
        this.productService.getProduct(this.productId).subscribe((data: product) => {
          this.productForm.patchValue(data);
        });
      }
    });
  }
  reset(){
    this.productForm.reset()
  }
  onSubmit() {
    if (this.productForm.invalid) return;

    if (this.isEdit && this.productId) {
      this.productService
        .updateProduct(this.productId, this.productForm.value)
        .subscribe(() => {
        this.log.openSnackBar('Product Updated Sucessfully.')

          this.router.navigate(['/']);
        });
    } else {
      this.productService
        .createProduct(this.productForm.value)
        .subscribe(() => {
        this.log.openSnackBar('Product created Sucessfully.')
          this.router.navigate(['/']);
        });
    }
  }
  checkError(formControl: AbstractControl): string {
    if(formControl.touched){
    if (formControl.hasError('required')) {
      return 'This field is required'
    }
  
    if (formControl.hasError('min')) {
      return 'Value must be greater then 0';
    }
  }
    return ''
  }
}
