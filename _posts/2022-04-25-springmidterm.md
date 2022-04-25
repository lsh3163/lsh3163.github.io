---
title: Machine-Learning Mid Term
tags: Spring-ML1
---

머신러닝 수업 예상 문제 및 풀이

<!--more-->

---

### Mid-Term

1. Find the dimensions of the box with largest volume if the total surface area is $64\text{cm}^2$.

$$\mathcal{L}=f(x,y,z)+\lambda(32-xy-yz-xz)$$

$$\mathcal{L}=xyz+\lambda(32-xy-yz-xz)$$

$$\mathcal{L}_x=yz+\lambda(-y-z)=0$$

$$\mathcal{L}_y=xz+\lambda(-x-z)=0$$

$$\mathcal{L}_z=xy+\lambda(-x-y)=0$$

$$\mathcal{L}_\lambda=32-xy-xz-yz=0$$

$x>0, y>0, z>0$ So 

$${xz\over x+z}={yz\over y+z}$$

$${x\over x+z}={y\over y+z}$$

$$xy+xz=xy+yz$$

$$x=y=z$$

$$x^2={32\over3}$$

$$f(x,y,z)=x^3={128\sqrt{2}\over3\sqrt{3}}$$

2. Find the maximum and minimum of $f(x,y)=5x-3y$ subject to the constraint $x^2+y^2=136$

3. Find the maximum and minimum values of $f(x,y,z)=xyz$ subject to the constraint $x+y+z=1$. Assume that $x,y,z\geq0$.

4. Find the maximum and minimum values of $f(x,y)=4x^2+10y^2$ on the disk $x^2+y^2 \leq 4$.

5. Find the maximum and minimum of $f(x,y,z)=4y-2z$ subject to the constraints $2x-y-z=2$ and $x^2+y^2=1$

6. Write pros and cons of Ridge and LASSO Regression.

7. Write three regularization techniques you know and explain it. (ex. Weight Decay)

8. What is Dropout?

9. What is Batch Normalization?

10. Differences of Linear regression and Kernel method.

11. In RBF Kernel, What happens when RBF kernel has Large $\sigma$ or small $\sigma$?

12. Why SVM uses signed distance instead of unsigned distance?

13. Explain about two tricks in SVM!

14. Find hyperplane function $h(x)$ and margin. There are four points and labels.

$x_1=\begin{bmatrix}0 \\ 0\end{bmatrix} x_2=\begin{bmatrix}2 \\ 2\end{bmatrix}
x_3=\begin{bmatrix}2 \\ 0\end{bmatrix}
x_4=\begin{bmatrix}3 \\ 0\end{bmatrix}$

$y_1=-1,y_2=-1,y_3=+1, y_4=+1$ 

15. Explain about Karush-Kahn-Tucker Conditions

16. SVM Problem : $\text{minimize}_{u_1, u_2} u^2_1+u^2_2$, subject to $\begin{bmatrix} 1 & 2 \\ 1 & 0 \\ 0 & 1 \\ \end{bmatrix}
\begin{bmatrix} u_1 \\ u_2 \end{bmatrix} \geq \begin{bmatrix} 2 \\ 0 \\ 0 \\ \end{bmatrix}$

17. If $C$ is big, then enforce $\xi$ to be small or big?

$\text{minimize}{1\over2}\|w\|^2_2+C\|\xi\|^2$

18. Radial Basis Function takes the form of

$K(u,v)=\exp\{-\gamma \|u-v\|^2_2\}$,

What happens if $\gamma$ is too big?

19. Write down the cross-entropy loss and explain why not use L2 loss.

20. Average Pooling vs Max Pooling

21. Explain SGD.

22. Write down the delta rule term.

23. Explain RNN and LSTM and Conv LSTM and GRU.

24. AlexNet

25. ZFNet

26. VGGNet

27. GoogleNet

28. ResNet

29. DenseNet

30. Depth-wise Seperable Convolution

31. EfficientNet v1

32. Compound Scaling

33. EfficientNet-v2

34. Overfitting and Underfitting

35. Random Initialization